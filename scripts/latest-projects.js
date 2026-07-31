(() => {
  const list = window.ATLAS_PROJECTS || [];
  if (!list.some(project => project.id === 'sentinel')) {
    list.unshift({
      id: 'sentinel',
      title: 'Sentinel',
      repo: 'https://github.com/DizzyZ7/Sentinel',
      category: 'platform',
      domain: 'Security Engineering / AI Review',
      status: 'Evidence-driven security platform',
      year: '2026',
      featured: true,
      private: false,
      accent: '#cf5b43',
      summary: 'Local-first evidence-to-patch security agent that combines deterministic triage, constrained AI review, patch escrow, non-executing regression proof and explicit human approval.',
      problem: 'Static analysis provides deterministic signals but produces noise, while unconstrained AI review can hallucinate vulnerabilities or unsafe fixes. Security remediation needs an auditable chain where every layer has a limited responsibility.',
      architecture: ['Repository / diff ingestion', 'Deterministic triage', 'Secret-safe context', 'Structured AI verdict', 'Patch escrow', 'Regression proof', 'Human gate', 'Evidence bundle'],
      stack: ['Python', 'FastAPI', 'PostgreSQL', 'SQLAlchemy', 'Pydantic', 'Docker', 'SARIF', 'GitHub Actions'],
      signals: ['Scanned source is not executed', 'Fail-closed release policy', 'Hash-covered evidence bundles', 'Baseline / delta gates', 'Local CLI + CI gate', 'Reproducible eval corpus']
    });
  }

  if (window.ATLAS_I18N?.projects) {
    window.ATLAS_I18N.projects.sentinel = {
      ru: {
        domain: 'Security Engineering / AI Review',
        status: 'Evidence-driven security platform',
        summary: 'Local-first security agent с цепочкой evidence → patch: deterministic triage, ограниченный AI-review, patch escrow, non-executing regression proof и обязательное решение человека.',
        problem: 'Статический анализ дает воспроизводимые сигналы, но создает шум; unconstrained AI-review способен галлюцинировать уязвимости и небезопасные исправления. Нужна аудируемая цепочка, где каждый слой отвечает только за свою часть решения.',
        architecture: ['Repository / diff ingestion', 'Deterministic triage', 'Secret-safe context', 'Structured AI verdict', 'Patch escrow', 'Regression proof', 'Human gate', 'Evidence bundle'],
        signals: ['Исходный код не исполняется при сканировании', 'Fail-closed release policy', 'Hash-covered evidence bundles', 'Baseline / delta gates', 'Local CLI + CI gate', 'Воспроизводимый eval corpus']
      }
    };
  }
})();