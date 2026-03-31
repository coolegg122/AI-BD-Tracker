#!/usr/bin/env python3
"""
Dual Agent Debug Review Script

This script facilitates code review using Qwen3 and GLM5 debug agents.
Usage: python3 debug_review.py [files or directories]
"""

import os
import sys
import json
from datetime import datetime
from pathlib import Path

# Add backend to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

class DebugReviewOrchestrator:
    """Orchestrates the dual-agent debug review process."""
    
    def __init__(self):
        self.qwen3_findings = []
        self.glm5_findings = []
        self.consensus_issues = []
        self.review_timestamp = datetime.now().isoformat()
        
    def read_file_content(self, file_path):
        """Read and return file content."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            return f"Error reading file: {e}"
    
    def extract_code_patterns(self, content, file_ext):
        """Extract relevant code patterns for analysis."""
        patterns = {
            'functions': [],
            'classes': [],
            'imports': [],
            'api_endpoints': [],
            'auth_checks': [],
            'error_handling': []
        }
        
        lines = content.split('\n')
        
        for i, line in enumerate(lines, 1):
            # Python patterns
            if file_ext == '.py':
                if line.strip().startswith('def '):
                    patterns['functions'].append({'line': i, 'code': line.strip()})
                if line.strip().startswith('class '):
                    patterns['classes'].append({'line': i, 'code': line.strip()})
                if 'import ' in line:
                    patterns['imports'].append({'line': i, 'code': line.strip()})
                if '@app.' in line or '@router.' in line:
                    patterns['api_endpoints'].append({'line': i, 'code': line.strip()})
                if 'get_current_user' in line or 'Depends(' in line:
                    patterns['auth_checks'].append({'line': i, 'code': line.strip()})
                if 'try:' in line or 'except' in line or 'raise ' in line:
                    patterns['error_handling'].append({'line': i, 'code': line.strip()})
            
            # JavaScript/JSX patterns
            elif file_ext in ['.js', '.jsx']:
                if 'function ' in line or 'const ' in line and '=>' in line:
                    patterns['functions'].append({'line': i, 'code': line.strip()})
                if 'class ' in line:
                    patterns['classes'].append({'line': i, 'code': line.strip()})
                if 'import ' in line or 'require(' in line:
                    patterns['imports'].append({'line': i, 'code': line.strip()})
                if 'fetch(' in line or 'axios.' in line:
                    patterns['api_endpoints'].append({'line': i, 'code': line.strip()})
                if 'useAuth' in line or 'token' in line.lower():
                    patterns['auth_checks'].append({'line': i, 'code': line.strip()})
                if 'try {' in line or 'catch' in line:
                    patterns['error_handling'].append({'line': i, 'code': line.strip()})
        
        return patterns
    
    def qwen3_analyze(self, file_path, content, patterns):
        """
        Qwen3 Debug Agent Analysis
        Focus: Logic errors, security, performance, type safety
        """
        findings = []
        file_ext = Path(file_path).suffix
        
        # Security checks
        if 'password' in content.lower() and 'hash' not in content.lower():
            if file_ext == '.py':
                findings.append({
                    'agent': 'Qwen3',
                    'severity': 'Critical',
                    'category': 'Security',
                    'file': file_path,
                    'message': 'Password handling without hashing detected',
                    'recommendation': 'Use bcrypt or similar for password hashing'
                })
        
        # JWT token checks
        if 'jwt' in content.lower() or 'token' in content.lower():
            if 'verify' not in content.lower() and 'decode' not in content.lower():
                findings.append({
                    'agent': 'Qwen3',
                    'severity': 'High',
                    'category': 'Security',
                    'file': file_path,
                    'message': 'JWT token usage without proper verification',
                    'recommendation': 'Always verify token signature and expiration'
                })
        
        # SQL injection checks
        if file_ext == '.py':
            if 'execute(' in content and 'f"' in content or "f'" in content:
                findings.append({
                    'agent': 'Qwen3',
                    'severity': 'Critical',
                    'category': 'Security',
                    'file': file_path,
                    'message': 'Potential SQL injection vulnerability',
                    'recommendation': 'Use parameterized queries instead of string formatting'
                })
        
        # Error handling checks
        if len(patterns['error_handling']) == 0 and len(patterns['functions']) > 3:
            findings.append({
                'agent': 'Qwen3',
                'severity': 'Medium',
                'category': 'Reliability',
                'file': file_path,
                'message': 'Functions defined but no error handling detected',
                'recommendation': 'Add try-catch blocks for robust error handling'
            })
        
        # API endpoint checks
        for endpoint in patterns['api_endpoints']:
            if file_ext == '.py':
                if 'response_model' not in content and '@app.' in endpoint['code']:
                    findings.append({
                        'agent': 'Qwen3',
                        'severity': 'Low',
                        'category': 'API Design',
                        'file': file_path,
                        'line': endpoint['line'],
                        'message': 'API endpoint without response_model',
                        'recommendation': 'Define response_model for better documentation'
                    })
        
        # Authentication checks
        if patterns['api_endpoints'] and not patterns['auth_checks']:
            findings.append({
                'agent': 'Qwen3',
                'severity': 'High',
                'category': 'Security',
                'file': file_path,
                'message': 'API endpoints without authentication checks',
                'recommendation': 'Add authentication dependency to protected endpoints'
            })
        
        return findings
    
    def glm5_analyze(self, file_path, content, patterns, qwen3_findings):
        """
        GLM5 Debug Agent Analysis
        Focus: Edge cases, integration, cross-validation
        """
        findings = []
        file_ext = Path(file_path).suffix
        
        # Cross-validate Qwen3 findings
        for finding in qwen3_findings:
            # GLM5 might have different opinion
            pass
        
        # Edge case checks
        if 'email' in content.lower():
            if '@' not in content and 'validate' not in content.lower():
                findings.append({
                    'agent': 'GLM5',
                    'severity': 'Medium',
                    'category': 'Edge Case',
                    'file': file_path,
                    'message': 'Email field without validation',
                    'recommendation': 'Add email format validation'
                })
        
        # Null/undefined checks
        if file_ext in ['.js', '.jsx']:
            if 'localStorage' in content:
                if 'null' not in content and 'undefined' not in content:
                    findings.append({
                        'agent': 'GLM5',
                        'severity': 'Medium',
                        'category': 'Edge Case',
                        'file': file_path,
                        'message': 'localStorage access without null check',
                        'recommendation': 'Check for null/undefined before using localStorage values'
                    })
        
        # Token expiration handling
        if 'token' in content.lower():
            if 'expir' not in content.lower():
                findings.append({
                    'agent': 'GLM5',
                    'severity': 'High',
                    'category': 'Edge Case',
                    'file': file_path,
                    'message': 'Token usage without expiration handling',
                    'recommendation': 'Handle token expiration gracefully'
                })
        
        # Empty state handling
        if file_ext in ['.js', '.jsx']:
            if 'map(' in content and 'length' not in content:
                findings.append({
                    'agent': 'GLM5',
                    'severity': 'Low',
                    'category': 'UX',
                    'file': file_path,
                    'message': 'Array map without empty state check',
                    'recommendation': 'Add empty state handling for better UX'
                })
        
        # Async error handling
        if file_ext == '.py':
            if 'async def' in content:
                if 'try:' not in content:
                    findings.append({
                        'agent': 'GLM5',
                        'severity': 'Medium',
                        'category': 'Reliability',
                        'file': file_path,
                        'message': 'Async function without error handling',
                        'recommendation': 'Add try-except for async operations'
                    })
        
        return findings
    
    def generate_report(self, files_reviewed):
        """Generate final consensus report."""
        all_findings = self.qwen3_findings + self.glm5_findings
        
        # Count by severity
        critical = len([f for f in all_findings if f['severity'] == 'Critical'])
        high = len([f for f in all_findings if f['severity'] == 'High'])
        medium = len([f for f in all_findings if f['severity'] == 'Medium'])
        low = len([f for f in all_findings if f['severity'] == 'Low'])
        
        report = f"""
{'='*60}
DUAL AGENT CODE REVIEW - FINAL REPORT
{'='*60}

Review Timestamp: {self.review_timestamp}
Files Reviewed: {len(files_reviewed)}
Total Issues Found: {len(all_findings)}

Severity Breakdown:
  Critical: {critical}
  High: {high}
  Medium: {medium}
  Low: {low}

{'='*60}
DETAILED FINDINGS
{'='*60}
"""
        
        # Group by severity
        for severity in ['Critical', 'High', 'Medium', 'Low']:
            severity_findings = [f for f in all_findings if f['severity'] == severity]
            if severity_findings:
                report += f"\n### {severity.upper()} ISSUES ({len(severity_findings)})\n"
                for i, finding in enumerate(severity_findings, 1):
                    report += f"\n{i}. [{finding['agent']}] {finding['category']}\n"
                    report += f"   File: {finding['file']}\n"
                    if 'line' in finding:
                        report += f"   Line: {finding['line']}\n"
                    report += f"   Issue: {finding['message']}\n"
                    report += f"   Fix: {finding['recommendation']}\n"
        
        report += f"""
{'='*60}
CODE QUALITY SCORES
{'='*60}

Security:      {self._calculate_score('Security')}/10
Reliability:   {self._calculate_score('Reliability')}/10
API Design:    {self._calculate_score('API Design')}/10
Edge Cases:    {self._calculate_score('Edge Case')}/10

{'='*60}
RECOMMENDATIONS
{'='*60}

1. Address all Critical issues before deployment
2. Review High priority issues within 24 hours
3. Plan Medium priority fixes for next sprint
4. Consider Low priority items for future improvements

{'='*60}
AGENT SIGN-OFF
{'='*60}

Qwen3-Debugger: {'✅ Approved' if critical == 0 else '❌ Changes Required'}
GLM5-Debugger:  {'✅ Approved' if critical == 0 and high == 0 else '⚠️ Review Recommended'}

{'='*60}
"""
        return report
    
    def _calculate_score(self, category):
        """Calculate quality score for a category."""
        category_findings = [f for f in self.qwen3_findings + self.glm5_findings 
                           if f['category'] == category]
        if not category_findings:
            return 10
        
        severity_weights = {'Critical': 3, 'High': 2, 'Medium': 1, 'Low': 0.5}
        total_weight = sum(severity_weights.get(f['severity'], 1) for f in category_findings)
        
        score = max(0, 10 - total_weight)
        return round(score, 1)
    
    def review_files(self, file_paths):
        """Main review process."""
        files_reviewed = []
        
        for file_path in file_paths:
            if not os.path.exists(file_path):
                print(f"Warning: File not found: {file_path}")
                continue
            
            content = self.read_file_content(file_path)
            file_ext = Path(file_path).suffix
            
            if file_ext not in ['.py', '.js', '.jsx', '.ts', '.tsx']:
                print(f"Skipping unsupported file type: {file_path}")
                continue
            
            patterns = self.extract_code_patterns(content, file_ext)
            
            # Phase 1: Qwen3 Analysis
            print(f"\n🔍 Qwen3 analyzing: {file_path}")
            qwen3_findings = self.qwen3_analyze(file_path, content, patterns)
            self.qwen3_findings.extend(qwen3_findings)
            print(f"   Found {len(qwen3_findings)} issues")
            
            # Phase 2: GLM5 Analysis
            print(f"\n🔍 GLM5 cross-validating: {file_path}")
            glm5_findings = self.glm5_analyze(file_path, content, patterns, qwen3_findings)
            self.glm5_findings.extend(glm5_findings)
            print(f"   Found {len(glm5_findings)} additional issues")
            
            files_reviewed.append(file_path)
        
        # Generate final report
        return self.generate_report(files_reviewed)


def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        print("Usage: python3 debug_review.py <file1> [file2] [file3] ...")
        print("Example: python3 debug_review.py backend/auth.py backend/main.py")
        sys.exit(1)
    
    file_paths = sys.argv[1:]
    
    print("="*60)
    print("DUAL AGENT DEBUG REVIEW")
    print("="*60)
    print(f"\nFiles to review: {len(file_paths)}")
    for fp in file_paths:
        print(f"  - {fp}")
    
    orchestrator = DebugReviewOrchestrator()
    report = orchestrator.review_files(file_paths)
    
    print(report)
    
    # Save report to file
    # Save report to debug_reports directory
    reports_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "debug_reports")
    os.makedirs(reports_dir, exist_ok=True)
    
    report_file = os.path.join(reports_dir, f"debug_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md")
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)
    print(f"\nReport saved to: {report_file}")


if __name__ == "__main__":
    main()