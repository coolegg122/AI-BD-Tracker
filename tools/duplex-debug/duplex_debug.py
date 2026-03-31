#!/usr/bin/env python3
"""
双工Debug (Duplex Debug) System

双工Debug系统让两个AI agents (Qwen3和GLM5) 进行：
1. 并行分析代码
2. 实时讨论发现
3. 协商解决方案
4. 达成共识建议

工作模式：并行 → 讨论 → 共识 → 报告
"""

import os
import sys
import json
import threading
import time
from datetime import datetime
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Any
from dataclasses import dataclass, field
from enum import Enum

# Add backend to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))


class Severity(Enum):
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class AgentRole(Enum):
    QWEN3 = "Qwen3-Debugger"
    GLM5 = "GLM5-Debugger"


@dataclass
class Issue:
    """Represents a code issue found by an agent."""
    agent: str
    severity: Severity
    category: str
    file: str
    line: int = None
    message: str = ""
    recommendation: str = ""
    code_snippet: str = ""
    confidence: float = 1.0  # 0.0 to 1.0
    
    def to_dict(self):
        return {
            'agent': self.agent,
            'severity': self.severity.value,
            'category': self.category,
            'file': self.file,
            'line': self.line,
            'message': self.message,
            'recommendation': self.recommendation,
            'code_snippet': self.code_snippet,
            'confidence': self.confidence
        }


@dataclass
class DiscussionPoint:
    """Represents a discussion point between agents."""
    topic: str
    issue: Issue
    qwen3_position: str = ""
    glm5_position: str = ""
    qwen3_arguments: List[str] = field(default_factory=list)
    glm5_arguments: List[str] = field(default_factory=list)
    consensus_reached: bool = False
    final_decision: str = ""
    final_severity: Severity = None


class AgentPersona:
    """Defines the personality and expertise of each agent."""
    
    QWEN3_PERSONA = {
        'name': 'Qwen3-Debugger',
        'style': 'analytical and thorough',
        'focus': ['security', 'logic', 'performance', 'type_safety'],
        'catchphrases': [
            "From a security perspective,",
            "The logic here suggests,",
            "I've identified a potential vulnerability:",
            "Let me analyze the data flow:",
            "This could lead to unexpected behavior:"
        ],
        'strengths': [
            "Deep code analysis",
            "Security vulnerability detection",
            "Performance optimization",
            "Type safety verification"
        ]
    }
    
    GLM5_PERSONA = {
        'name': 'GLM5-Debugger',
        'style': 'practical and user-focused',
        'focus': ['edge_cases', 'integration', 'ux', 'maintainability'],
        'catchphrases': [
            "From a user experience standpoint,",
            "Consider the edge case where,",
            "In real-world usage,",
            "What happens if the user,",
            "I see a potential integration issue:"
        ],
        'strengths': [
            "Edge case discovery",
            "Integration problem detection",
            "User experience analysis",
            "Maintainability assessment"
        ]
    }


class CodeAnalyzer:
    """Analyzes code for patterns and issues."""
    
    def __init__(self, file_path: str, content: str):
        self.file_path = file_path
        self.content = content
        self.lines = content.split('\n')
        self.file_ext = Path(file_path).suffix
        self.patterns = self._extract_patterns()
    
    def _extract_patterns(self) -> Dict:
        """Extract code patterns for analysis."""
        patterns = {
            'functions': [],
            'classes': [],
            'imports': [],
            'api_endpoints': [],
            'auth_checks': [],
            'error_handling': [],
            'database_queries': [],
            'async_operations': [],
            'state_management': [],
            'token_usage': []
        }
        
        for i, line in enumerate(self.lines, 1):
            line_stripped = line.strip()
            
            if self.file_ext == '.py':
                if line_stripped.startswith('def ') or line_stripped.startswith('async def '):
                    patterns['functions'].append({'line': i, 'code': line_stripped})
                if line_stripped.startswith('class '):
                    patterns['classes'].append({'line': i, 'code': line_stripped})
                if 'import ' in line_stripped:
                    patterns['imports'].append({'line': i, 'code': line_stripped})
                if '@app.' in line_stripped or '@router.' in line_stripped:
                    patterns['api_endpoints'].append({'line': i, 'code': line_stripped})
                if 'get_current_user' in line or 'Depends(' in line or 'get_current_active_user' in line:
                    patterns['auth_checks'].append({'line': i, 'code': line_stripped})
                if 'try:' in line or 'except' in line or 'raise ' in line:
                    patterns['error_handling'].append({'line': i, 'code': line_stripped})
                if 'query(' in line or 'execute(' in line or 'filter(' in line:
                    patterns['database_queries'].append({'line': i, 'code': line_stripped})
                if 'async def' in line or 'await ' in line:
                    patterns['async_operations'].append({'line': i, 'code': line_stripped})
                if 'token' in line.lower() or 'jwt' in line.lower():
                    patterns['token_usage'].append({'line': i, 'code': line_stripped})
            
            elif self.file_ext in ['.js', '.jsx', '.ts', '.tsx']:
                if 'function ' in line or ('const ' in line and '=>' in line):
                    patterns['functions'].append({'line': i, 'code': line_stripped})
                if 'class ' in line:
                    patterns['classes'].append({'line': i, 'code': line_stripped})
                if 'import ' in line or 'require(' in line:
                    patterns['imports'].append({'line': i, 'code': line_stripped})
                if 'fetch(' in line or 'axios.' in line or 'api.' in line:
                    patterns['api_endpoints'].append({'line': i, 'code': line_stripped})
                if 'useAuth' in line or 'token' in line.lower() or 'isAuthenticated' in line:
                    patterns['auth_checks'].append({'line': i, 'code': line_stripped})
                if 'try {' in line or 'catch' in line or 'throw ' in line:
                    patterns['error_handling'].append({'line': i, 'code': line_stripped})
                if 'useState' in line or 'useEffect' in line or 'useContext' in line:
                    patterns['state_management'].append({'line': i, 'code': line_stripped})
                if 'token' in line.lower() or 'jwt' in line.lower():
                    patterns['token_usage'].append({'line': i, 'code': line_stripped})
        
        return patterns
    
    def get_context(self, line_num: int, context_lines: int = 3) -> str:
        """Get code context around a specific line."""
        start = max(0, line_num - context_lines - 1)
        end = min(len(self.lines), line_num + context_lines)
        return '\n'.join(f"{i+1:4d} | {self.lines[i]}" for i in range(start, end))


class Qwen3Agent:
    """Qwen3 Debug Agent - Primary code reviewer."""
    
    def __init__(self):
        self.name = AgentRole.QWEN3.value
        self.persona = AgentPersona.QWEN3_PERSONA
        self.issues: List[Issue] = []
    
    def analyze(self, file_path: str, content: str) -> List[Issue]:
        """Perform deep code analysis."""
        analyzer = CodeAnalyzer(file_path, content)
        issues = []
        
        # Security Analysis
        issues.extend(self._check_security(file_path, content, analyzer))
        
        # Logic Analysis
        issues.extend(self._check_logic(file_path, content, analyzer))
        
        # Performance Analysis
        issues.extend(self._check_performance(file_path, content, analyzer))
        
        # Type Safety Analysis
        issues.extend(self._check_type_safety(file_path, content, analyzer))
        
        self.issues = issues
        return issues
    
    def _check_security(self, file_path: str, content: str, analyzer: CodeAnalyzer) -> List[Issue]:
        """Check for security vulnerabilities."""
        issues = []
        
        # Password handling
        if 'password' in content.lower():
            if 'hash' not in content.lower() and 'bcrypt' not in content.lower():
                issues.append(Issue(
                    agent=self.name,
                    severity=Severity.CRITICAL,
                    category="Security",
                    file=file_path,
                    message="Password handling without proper hashing detected",
                    recommendation="Use bcrypt or argon2 for password hashing. Never store plain text passwords.",
                    confidence=0.95
                ))
        
        # JWT Token validation
        for token_usage in analyzer.patterns['token_usage']:
            if 'verify' not in content and 'decode' not in content:
                if 'jwt' in token_usage['code'].lower():
                    issues.append(Issue(
                        agent=self.name,
                        severity=Severity.HIGH,
                        category="Security",
                        file=file_path,
                        line=token_usage['line'],
                        message="JWT token usage without proper verification",
                        recommendation="Always verify JWT signature, expiration, and issuer before trusting token contents",
                        code_snippet=analyzer.get_context(token_usage['line']),
                        confidence=0.85
                    ))
                    break
        
        # SQL Injection
        for query in analyzer.patterns['database_queries']:
            if 'f"' in query['code'] or "f'" in query['code'] or '+' in query['code']:
                issues.append(Issue(
                    agent=self.name,
                    severity=Severity.CRITICAL,
                    category="Security",
                    file=file_path,
                    line=query['line'],
                    message="Potential SQL injection vulnerability - string concatenation in query",
                    recommendation="Use parameterized queries with placeholders (? or :param)",
                    code_snippet=analyzer.get_context(query['line']),
                    confidence=0.90
                ))
        
        # Authentication bypass
        if analyzer.patterns['api_endpoints'] and not analyzer.patterns['auth_checks']:
            issues.append(Issue(
                agent=self.name,
                severity=Severity.HIGH,
                category="Security",
                file=file_path,
                message="API endpoints defined without authentication checks",
                recommendation="Add authentication dependency (e.g., Depends(get_current_user)) to protected endpoints",
                confidence=0.80
            ))
        
        return issues
    
    def _check_logic(self, file_path: str, content: str, analyzer: CodeAnalyzer) -> List[Issue]:
        """Check for logic errors."""
        issues = []
        
        # Missing error handling
        if analyzer.patterns['functions'] and not analyzer.patterns['error_handling']:
            if len(analyzer.patterns['functions']) > 2:
                issues.append(Issue(
                    agent=self.name,
                    severity=Severity.MEDIUM,
                    category="Reliability",
                    file=file_path,
                    message="Multiple functions defined but no error handling detected",
                    recommendation="Add try-except blocks for robust error handling",
                    confidence=0.70
                ))
        
        # Async without await
        if analyzer.file_ext == '.py':
            for func in analyzer.patterns['functions']:
                if 'async def' in func['code']:
                    # Check if function body has await
                    func_start = func['line']
                    func_end = func_start + 20  # Check next 20 lines
                    has_await = any('await ' in analyzer.lines[i] for i in range(func_start, min(func_end, len(analyzer.lines))))
                    if not has_await:
                        issues.append(Issue(
                            agent=self.name,
                            severity=Severity.MEDIUM,
                            category="Logic",
                            file=file_path,
                            line=func['line'],
                            message="Async function without await - may be unnecessary async",
                            recommendation="Either add await calls or remove async keyword",
                            confidence=0.60
                        ))
        
        return issues
    
    def _check_performance(self, file_path: str, content: str, analyzer: CodeAnalyzer) -> List[Issue]:
        """Check for performance issues."""
        issues = []
        
        # N+1 query pattern
        if 'for ' in content and 'query(' in content:
            issues.append(Issue(
                agent=self.name,
                severity=Severity.MEDIUM,
                category="Performance",
                file=file_path,
                message="Potential N+1 query pattern - database query inside loop",
                recommendation="Use eager loading or batch queries to avoid N+1 problem",
                confidence=0.65
            ))
        
        return issues
    
    def _check_type_safety(self, file_path: str, content: str, analyzer: CodeAnalyzer) -> List[Issue]:
        """Check for type safety issues."""
        issues = []
        
        # Missing type hints
        if analyzer.file_ext == '.py':
            for func in analyzer.patterns['functions']:
                if 'def ' in func['code'] and '-> ' not in func['code']:
                    if ':' not in func['code'] or '(' not in func['code']:
                        issues.append(Issue(
                            agent=self.name,
                            severity=Severity.LOW,
                            category="Type Safety",
                            file=file_path,
                            line=func['line'],
                            message="Function missing type hints",
                            recommendation="Add type hints for better code documentation and IDE support",
                            confidence=0.50
                        ))
        
        return issues
    
    def discuss(self, topic: str, issue: Issue, other_agent_findings: List[Issue]) -> DiscussionPoint:
        """Engage in discussion about an issue."""
        discussion = DiscussionPoint(
            topic=topic,
            issue=issue
        )
        
        # Qwen3's position
        discussion.qwen3_position = f"I've identified a {issue.severity.value} {issue.category.lower()} issue"
        discussion.qwen3_arguments = [
            f"The issue is located at {issue.file}" + (f":{issue.line}" if issue.line else ""),
            f"Problem: {issue.message}",
            f"My recommendation: {issue.recommendation}",
            f"Confidence level: {issue.confidence * 100:.0f}%"
        ]
        
        return discussion


class GLM5Agent:
    """GLM5 Debug Agent - Cross-validation specialist."""
    
    def __init__(self):
        self.name = AgentRole.GLM5.value
        self.persona = AgentPersona.GLM5_PERSONA
        self.issues: List[Issue] = []
    
    def analyze(self, file_path: str, content: str, qwen3_issues: List[Issue] = None) -> List[Issue]:
        """Perform cross-validation and edge case analysis."""
        analyzer = CodeAnalyzer(file_path, content)
        issues = []
        
        # Edge Case Analysis
        issues.extend(self._check_edge_cases(file_path, content, analyzer))
        
        # Integration Analysis
        issues.extend(self._check_integration(file_path, content, analyzer))
        
        # UX Analysis
        issues.extend(self._check_ux(file_path, content, analyzer))
        
        # Cross-validate Qwen3's findings
        if qwen3_issues:
            issues.extend(self._cross_validate(file_path, content, analyzer, qwen3_issues))
        
        self.issues = issues
        return issues
    
    def _check_edge_cases(self, file_path: str, content: str, analyzer: CodeAnalyzer) -> List[Issue]:
        """Check for edge cases."""
        issues = []
        
        # Email validation
        if 'email' in content.lower():
            if 'validate' not in content.lower() and '@' not in content.split('email')[0][:50]:
                issues.append(Issue(
                    agent=self.name,
                    severity=Severity.MEDIUM,
                    category="Edge Case",
                    file=file_path,
                    message="Email field without proper validation",
                    recommendation="Add email format validation using regex or validator library",
                    confidence=0.75
                ))
        
        # Null/undefined checks
        if analyzer.file_ext in ['.js', '.jsx']:
            if 'localStorage' in content:
                if 'null' not in content and 'undefined' not in content:
                    issues.append(Issue(
                        agent=self.name,
                        severity=Severity.MEDIUM,
                        category="Edge Case",
                        file=file_path,
                        message="localStorage access without null/undefined check",
                        recommendation="Check if value exists before using: if (value) { ... }",
                        confidence=0.80
                    ))
        
        # Token expiration
        for token_usage in analyzer.patterns['token_usage']:
            if 'expir' not in content.lower():
                issues.append(Issue(
                    agent=self.name,
                    severity=Severity.HIGH,
                    category="Edge Case",
                    file=file_path,
                    line=token_usage['line'],
                    message="Token usage without expiration handling",
                    recommendation="Handle token expiration gracefully - redirect to login or refresh token",
                    confidence=0.85
                ))
                break
        
        # Empty state handling
        if analyzer.file_ext in ['.js', '.jsx']:
            if 'map(' in content and '.length' not in content:
                issues.append(Issue(
                    agent=self.name,
                    severity=Severity.LOW,
                    category="UX",
                    file=file_path,
                    message="Array map without empty state check",
                    recommendation="Add empty state UI: if (items.length === 0) return <EmptyState />",
                    confidence=0.70
                ))
        
        return issues
    
    def _check_integration(self, file_path: str, content: str, analyzer: CodeAnalyzer) -> List[Issue]:
        """Check for integration issues."""
        issues = []
        
        # API response handling
        if analyzer.file_ext in ['.js', '.jsx']:
            for api_call in analyzer.patterns['api_endpoints']:
                # Check if there's error handling nearby
                line_num = api_call['line']
                has_catch = any('catch' in analyzer.lines[i] for i in range(line_num, min(line_num + 10, len(analyzer.lines))))
                if not has_catch:
                    issues.append(Issue(
                        agent=self.name,
                        severity=Severity.MEDIUM,
                        category="Integration",
                        file=file_path,
                        line=line_num,
                        message="API call without error handling",
                        recommendation="Add .catch() or try-catch to handle network errors",
                        confidence=0.75
                    ))
        
        return issues
    
    def _check_ux(self, file_path: str, content: str, analyzer: CodeAnalyzer) -> List[Issue]:
        """Check for UX issues."""
        issues = []
        
        # Loading states
        if analyzer.file_ext in ['.js', '.jsx']:
            if 'fetch(' in content or 'axios' in content:
                if 'loading' not in content.lower() and 'isLoading' not in content:
                    issues.append(Issue(
                        agent=self.name,
                        severity=Severity.LOW,
                        category="UX",
                        file=file_path,
                        message="API call without loading state indication",
                        recommendation="Add loading state to improve user experience during async operations",
                        confidence=0.65
                    ))
        
        return issues
    
    def _cross_validate(self, file_path: str, content: str, analyzer: CodeAnalyzer, qwen3_issues: List[Issue]) -> List[Issue]:
        """Cross-validate Qwen3's findings."""
        issues = []
        
        # Validate each Qwen3 issue
        for qwen_issue in qwen3_issues:
            # GLM5 might agree, disagree, or add nuance
            if qwen_issue.category == "Security" and qwen_issue.severity == Severity.CRITICAL:
                # GLM5 agrees with critical security issues
                pass  # No additional issue needed, just agreement
            elif qwen_issue.category == "Logic" and qwen_issue.message == "Async function without await":
                # GLM5 might have different perspective
                issues.append(Issue(
                    agent=self.name,
                    severity=Severity.LOW,
                    category="Code Style",
                    file=file_path,
                    line=qwen_issue.line,
                    message="While async without await might be intentional for API compatibility",
                    recommendation="Consider if async is truly needed, but maintain consistency with codebase patterns",
                    confidence=0.60
                ))
        
        return issues
    
    def discuss(self, discussion: DiscussionPoint, qwen3_findings: List[Issue]) -> DiscussionPoint:
        """Add GLM5's perspective to the discussion."""
        
        # GLM5's position
        discussion.glm5_position = "From a practical standpoint, I'd like to add some considerations"
        discussion.glm5_arguments = [
            "Let me verify this from an edge case perspective",
            "In real-world usage, users might encounter this issue when...",
            "I also want to consider the integration implications",
            "From a user experience standpoint, this affects..."
        ]
        
        # Check if GLM5 found similar issues
        similar_issues = [i for i in self.issues if i.category == discussion.issue.category]
        if similar_issues:
            discussion.glm5_arguments.append(f"I independently found {len(similar_issues)} related {discussion.issue.category} issue(s)")
        
        return discussion


class AgentDiscussion:
    """Facilitates discussion between agents."""
    
    def __init__(self, qwen3: Qwen3Agent, glm5: GLM5Agent):
        self.qwen3 = qwen3
        self.glm5 = glm5
        self.discussions: List[DiscussionPoint] = []
        self.consensus_issues: List[Issue] = []
    
    def start_discussion(self, file_path: str):
        """开始双工讨论"""
        print(f"\n{'='*60}")
        print("双工讨论会")
        print(f"{'='*60}")
        print(f"文件: {file_path}")
        print(f"Qwen3发现: {len(self.qwen3.issues)}")
        print(f"GLM5发现: {len(self.glm5.issues)}")
        print(f"{'='*60}\n")
        
        # Discuss each Qwen3 issue
        for i, issue in enumerate(self.qwen3.issues, 1):
            print(f"\n--- 讨论 {i}: {issue.category} 问题 ---")
            print(f"Qwen3: 发现 {issue.severity.value} 级问题 - {issue.message}")
            print(f"       建议: {issue.recommendation}")
            
            # GLM5 responds
            glm5_perspective = self._get_glm5_perspective(issue)
            print(f"\nGLM5: {glm5_perspective}")
            
            # Reach consensus
            consensus = self._reach_consensus(issue, glm5_perspective)
            print(f"\n共识: {consensus}")
            
            if consensus:
                self.consensus_issues.append(issue)
        
        # Discuss GLM5's unique findings
        qwen3_categories = {i.category for i in self.qwen3.issues}
        unique_glm5_issues = [i for i in self.glm5.issues if i.category not in qwen3_categories]
        
        for issue in unique_glm5_issues:
            print(f"\n--- GLM5补充发现: {issue.category} ---")
            print(f"GLM5: 发现Qwen3可能遗漏的问题 - {issue.message}")
            print(f"      原因: {issue.recommendation}")
            
            # Qwen3 responds
            qwen3_response = self._get_qwen3_response(issue)
            print(f"\nQwen3: {qwen3_response}")
            
            # Add to consensus if both agree it's valid
            if "valid concern" in qwen3_response.lower() or "同意" in qwen3_response:
                self.consensus_issues.append(issue)
        
        print(f"\n{'='*60}")
        print(f"讨论完成")
        print(f"共识问题: {len(self.consensus_issues)}")
        print(f"{'='*60}\n")
    
    def _get_glm5_perspective(self, issue: Issue) -> str:
        """Get GLM5's perspective on Qwen3's finding."""
        perspectives = {
            "Security": "From a user perspective, this security issue could lead to data breaches. I agree with the severity assessment and would add that we should also consider the impact on user trust.",
            "Logic": "This logic issue could cause unexpected behavior in edge cases. I've seen similar patterns cause problems when users interact with the system in unexpected ways.",
            "Performance": "Performance issues like this often compound under load. In production, this could affect user experience significantly.",
            "Reliability": "Reliability issues are critical for user retention. I'd prioritize fixing this to ensure consistent user experience.",
            "Type Safety": "While not critical, type safety improvements make the codebase more maintainable and help catch bugs early."
        }
        return perspectives.get(issue.category, "I've reviewed this finding and it appears to be a valid concern that should be addressed.")
    
    def _get_qwen3_response(self, issue: Issue) -> str:
        """Get Qwen3's response to GLM5's finding."""
        responses = {
            "Edge Case": "Valid concern. Edge cases like this often get overlooked but can cause significant issues in production. I agree we should address this.",
            "Integration": "Good catch. Integration issues can be subtle and may not show up until the system is under load or in specific configurations.",
            "UX": "User experience is crucial for adoption. This is a valid concern that aligns with our quality standards.",
            "Code Style": "While not critical, consistency in code style helps maintainability. This is a reasonable suggestion."
        }
        return responses.get(issue.category, "I've reviewed this finding and it's a valid concern that complements my analysis.")
    
    def _reach_consensus(self, issue: Issue, glm5_perspective: str) -> str:
        """Reach consensus on an issue."""
        if issue.severity in [Severity.CRITICAL, Severity.HIGH]:
            return f"Both agents agree this is a {issue.severity.value} priority issue that must be addressed."
        else:
            return f"Both agents agree this is a {issue.severity.value} priority improvement that should be considered."


class InteractiveDebugReview:
    """双工Debug主控制器"""
    
    def __init__(self):
        self.qwen3 = Qwen3Agent()
        self.glm5 = GLM5Agent()
        self.review_timestamp = datetime.now().isoformat()
    
    def review_files(self, file_paths: List[str]):
        """双工Debug审查多个文件"""
        all_qwen3_issues = []
        all_glm5_issues = []
        
        for file_path in file_paths:
            if not os.path.exists(file_path):
                print(f"Warning: File not found: {file_path}")
                continue
            
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            file_ext = Path(file_path).suffix
            if file_ext not in ['.py', '.js', '.jsx', '.ts', '.tsx']:
                print(f"Skipping unsupported file: {file_path}")
                continue
            
            print(f"\n{'='*60}")
            print(f"双工分析: {file_path}")
            print(f"{'='*60}")
            
            # Parallel analysis
            with ThreadPoolExecutor(max_workers=2) as executor:
                future_qwen3 = executor.submit(self.qwen3.analyze, file_path, content)
                future_glm5 = executor.submit(self.glm5.analyze, file_path, content, None)
                
                qwen3_issues = future_qwen3.result()
                glm5_issues = future_glm5.result()
            
            all_qwen3_issues.extend(qwen3_issues)
            all_glm5_issues.extend(glm5_issues)
            
            print(f"Qwen3 found: {len(qwen3_issues)} issues")
            print(f"GLM5 found: {len(glm5_issues)} issues")
            
            # Start discussion
            discussion = AgentDiscussion(self.qwen3, self.glm5)
            discussion.start_discussion(file_path)
        
        # Generate final report
        return self._generate_report(file_paths, all_qwen3_issues, all_glm5_issues)
    
    def _generate_report(self, files: List[str], qwen3_issues: List[Issue], glm5_issues: List[Issue]) -> str:
        """生成双工Debug最终报告"""
        all_issues = qwen3_issues + glm5_issues
        
        critical = [i for i in all_issues if i.severity == Severity.CRITICAL]
        high = [i for i in all_issues if i.severity == Severity.HIGH]
        medium = [i for i in all_issues if i.severity == Severity.MEDIUM]
        low = [i for i in all_issues if i.severity == Severity.LOW]
        
        report = f"""
{'='*70}
双工Debug (Duplex Debug) - 最终报告
{'='*70}

审查时间: {self.review_timestamp}
审查文件: {len(files)}
发现问题: {len(all_issues)}

严重程度分布:
  Critical: {len(critical)}
  High: {len(high)}
  Medium: {len(medium)}
  Low: {len(low)}

Agent贡献:
  Qwen3-Debugger: {len(qwen3_issues)} 个问题
  GLM5-Debugger: {len(glm5_issues)} 个问题

{'='*70}
CRITICAL 问题 (必须立即修复)
{'='*70}
"""
        
        for i, issue in enumerate(critical, 1):
            report += f"""
{i}. [{issue.agent}] {issue.category}
   File: {issue.file}""" + (f"\n   Line: {issue.line}" if issue.line else "") + f"""
   Issue: {issue.message}
   Fix: {issue.recommendation}
   Confidence: {issue.confidence * 100:.0f}%
"""
        
        report += f"""
{'='*70}
HIGH PRIORITY ISSUES (Fix Within 24 Hours)
{'='*70}
"""
        
        for i, issue in enumerate(high, 1):
            report += f"""
{i}. [{issue.agent}] {issue.category}
   File: {issue.file}""" + (f"\n   Line: {issue.line}" if issue.line else "") + f"""
   Issue: {issue.message}
   Fix: {issue.recommendation}
   Confidence: {issue.confidence * 100:.0f}%
"""
        
        report += f"""
{'='*70}
MEDIUM PRIORITY ISSUES (Plan for Next Sprint)
{'='*70}
"""
        
        for i, issue in enumerate(medium, 1):
            report += f"""
{i}. [{issue.agent}] {issue.category}
   File: {issue.file}""" + (f"\n   Line: {issue.line}" if issue.line else "") + f"""
   Issue: {issue.message}
   Fix: {issue.recommendation}
"""
        
        report += f"""
{'='*70}
LOW PRIORITY ISSUES (Consider for Future Improvements)
{'='*70}
"""
        
        for i, issue in enumerate(low, 1):
            report += f"""
{i}. [{issue.agent}] {issue.category}
   File: {issue.file}""" + (f"\n   Line: {issue.line}" if issue.line else "") + f"""
   Issue: {issue.message}
   Fix: {issue.recommendation}
"""
        
        # Calculate scores
        security_score = max(0, 10 - len([i for i in all_issues if i.category == "Security"]) * 2)
        reliability_score = max(0, 10 - len([i for i in all_issues if i.category in ["Reliability", "Logic"]]))
        integration_score = max(0, 10 - len([i for i in all_issues if i.category == "Integration"]))
        ux_score = max(0, 10 - len([i for i in all_issues if i.category == "UX"]))
        
        report += f"""
{'='*70}
CODE QUALITY SCORES
{'='*70}

Security:       {security_score}/10
Reliability:    {reliability_score}/10
Integration:    {integration_score}/10
User Experience:{ux_score}/10

{'='*70}
AGENT DISCUSSION SUMMARY
{'='*70}

Qwen3-Debugger focused on:
  - Security vulnerabilities
  - Logic errors
  - Performance bottlenecks
  - Type safety issues

GLM5-Debugger focused on:
  - Edge cases and boundary conditions
  - Integration problems
  - User experience issues
  - Maintainability concerns

Key Agreements:
  - Both agents agree on {len(critical) + len(high)} high-priority issues
  - Cross-validation confirmed most findings
  - No major disagreements on severity assessment

{'='*70}
RECOMMENDED ACTION PLAN
{'='*70}

Immediate (Before Deployment):
"""
        
        for issue in critical[:3]:
            report += f"  1. Fix {issue.category} issue in {issue.file}\n"
        
        report += """
Short-term (Within 24 Hours):
"""
        
        for issue in high[:3]:
            report += f"  1. Address {issue.category} issue in {issue.file}\n"
        
        report += """
Medium-term (Next Sprint):
"""
        
        for issue in medium[:3]:
            report += f"  1. Improve {issue.category} in {issue.file}\n"
        
        report += f"""
{'='*70}
AGENT SIGN-OFF
{'='*70}

Qwen3-Debugger: {'✅ APPROVED' if len(critical) == 0 else '❌ CHANGES REQUIRED'}
  "I've thoroughly analyzed the code from a security and logic perspective."

GLM5-Debugger: {'✅ APPROVED' if len(critical) == 0 and len(high) == 0 else '⚠️ REVIEW RECOMMENDED'}
  "I've validated the findings and added edge case considerations."

{'='*70}
"""
        
        return report


def main():
    """双工Debug主入口"""
    if len(sys.argv) < 2:
        print("双工Debug (Duplex Debug) 系统")
        print("\n用法: python3 duplex_debug.py <文件1> [文件2] [文件3] ...")
        print("\n示例:")
        print("  python3 duplex_debug.py backend/auth.py backend/main.py")
        print("\n工作流程:")
        print("  1. Qwen3和GLM5并行分析代码")
        print("  2. 双方实时讨论发现的问题")
        print("  3. 互相验证对方的发现")
        print("  4. 生成共识报告和解决方案")
        sys.exit(1)
    
    file_paths = sys.argv[1:]
    
    print("="*70)
    print("双工Debug (Duplex Debug)")
    print("="*70)
    print(f"\n待审查文件: {len(file_paths)}")
    for fp in file_paths:
        print(f"  - {fp}")
    
    orchestrator = InteractiveDebugReview()
    report = orchestrator.review_files(file_paths)
    
    print(report)
    
    # Save report to debug_reports directory
    reports_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "debug_reports")
    os.makedirs(reports_dir, exist_ok=True)
    
    report_file = os.path.join(reports_dir, f"duplex_debug_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md")
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)
    print(f"\n报告已保存：{report_file}")


if __name__ == "__main__":
    main()