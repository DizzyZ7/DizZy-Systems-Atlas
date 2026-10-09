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


  // Selected active systems. Private repositories are represented by public-safe case summaries only.
  const privateFlagships = [
    {
      id: 'janqor', title: 'JANQOR', repo: '', category: 'platform',
      domain: 'Operational Intelligence / B2B', status: 'PRIVATE · Pilot engineering',
      year: '2026', featured: true, private: true, accent: '#7cf7c4',
      summary: 'Operational control plane: observe business events, detect loss patterns, govern actions and retain auditable proof of outcomes. No live client deployment is claimed.',
      problem: 'Operational data is distributed across tools; teams need repeatable, accountable workflows rather than another disconnected dashboard.',
      architecture: ['Event ingestion', 'Tenant scope', 'Deterministic detection', 'Governed action', 'Transactional outbox', 'Value ledger'],
      stack: ['Python', 'FastAPI', 'PostgreSQL', 'SQLAlchemy', 'Redis', 'Celery'],
      signals: ['Tenant-scoped operator access', 'Audit trail', 'Readiness / telemetry', 'PostgreSQL E2E']
    },
    {
      id: 'vinflow', title: 'VINFLOW', repo: '', category: 'product',
      domain: 'Automotive Operations / B2B SaaS', status: 'PRIVATE · Local pilot prototype',
      year: '2026', featured: true, private: true, accent: '#9accff',
      summary: 'A CI-tested local prototype joining vehicle-document ingestion, OCR review, inventory and controlled sales workflows. Not production-ready.',
      problem: 'Vehicle operations accumulate disconnected documents, manual corrections, repeated entries and ambiguous inventory states.',
      architecture: ['Document inbox', 'PDF / OCR', 'Human review', 'Vehicle inventory', 'Sale workflow', 'Audit'],
      stack: ['Python', 'FastAPI', 'PostgreSQL', 'React', 'TypeScript', 'Docker'],
      signals: ['Tenant-scoped data', 'Original file preservation', 'Operator approval', 'Local smoke tests']
    }
  ];
  for (const project of [...privateFlagships].reverse()) {
    if (!list.some(existing => existing.id === project.id)) list.unshift(project);
  }

  const furtherSystems = [
    {
      id: 'catoku', title: 'Catoku', repo: '', live: 'https://t.me/catoku_bot',
      category: 'product', domain: 'Telegram Mini App / Logic Game',
      status: 'PRIVATE · Active game development', year: '2026', featured: false, private: true, accent: '#ffcf9e',
      summary: 'A rule-driven cat logic game with daily play, persistent progression and repeatable challenges in a Telegram Mini App.',
      problem: 'A short puzzle needs trustworthy validation and lasting progression without turning cosmetic rewards into gameplay advantages.',
      architecture: ['Telegram WebApp auth', 'Puzzle validation', 'Progression', 'Daily / seasons', 'PostgreSQL'],
      stack: ['Python', 'FastAPI', 'aiogram', 'PostgreSQL', 'JavaScript'],
      signals: ['initData validation', 'Server-side state', 'Mobile-first UX', 'Long-term progression']
    },
    {
      id: 'islumi', title: 'ISLUMI', repo: '', category: 'product',
      domain: 'Procedural Worlds / Telegram Mini App', status: 'PRIVATE · Playable test build',
      year: '2026', featured: false, private: true, accent: '#c9acff',
      summary: 'A test-build island world with individual seeds, different biomes, expeditions and persistent exploration progress.',
      problem: 'Collectible exploration requires distinctive worlds and persistence rather than a static clicker loop.',
      architecture: ['Personal island seed', 'Biomes', 'Expedition cycle', 'Collection', 'Persistence'],
      stack: ['React', 'TypeScript', 'Vite', 'FastAPI', 'PostgreSQL'],
      signals: ['Playtest deployment', 'Backend-owned state', 'Migrations', 'CI checks']
    },
    {
      id: 'pokehub', title: 'PokéHub / Raid Lab', repo: '', category: 'product',
      domain: 'Telegram Game Systems', status: 'PRIVATE · Iterative development',
      year: '2026', featured: false, private: true, accent: '#e8bd74',
      summary: 'Telegram collecting game and Mini App with raids, collection tools and breeding workflows synchronized through PostgreSQL.',
      problem: 'Concurrent game actions and repeated confirmation taps must not duplicate rewards or charge resources twice.',
      architecture: ['Telegram commands', 'Mini App', 'Raids', 'Breeding', 'Operation guard', 'PostgreSQL'],
      stack: ['Python', 'aiogram', 'SQLAlchemy', 'PostgreSQL', 'Alembic'],
      signals: ['Database-authoritative state', 'Operation idempotency', 'Bounded scans', 'Shared domain services']
    },
    {
      id: 'chain-scribe', title: 'ChainScribe API',
      repo: 'https://github.com/DizzyZ7/ChainScribe-API', category: 'backend',
      domain: 'Secure API / Content Platform', status: 'PUBLIC · Security-focused backend',
      year: '2026', featured: false, private: false, accent: '#78dcbd',
      summary: 'Django Ninja publishing API with token lifecycle, content ownership, immutable audit events, rate limiting and CI.',
      problem: 'Publishing services need strict ownership and credential boundaries without losing operational traceability.',
      architecture: ['Versioned API', 'Auth / ownership', 'PostgreSQL', 'Audit events', 'Redis limits', 'CI'],
      stack: ['Python', 'Django Ninja', 'PostgreSQL', 'Redis', 'Docker'],
      signals: ['Argon2 + token digests', 'Ownership enforcement', 'Correlation IDs', 'PostgreSQL tests']
    },
    {
      id: 'touch-grass', title: 'TOUCH GRASS.exe',
      repo: 'https://github.com/DizzyZ7/Grass', category: 'product',
      domain: 'Interactive Game / Telegram Mini App', status: 'PUBLIC · Active feature iteration',
      year: '2026', featured: false, private: false, accent: '#aee67b',
      summary: 'A self-aware IT-meme game with server-validated sessions, daily field missions, weather variations and progress rewards.',
      problem: 'A lightweight joke game can still have consistent state, original interactions and meaningful replay loops.',
      architecture: ['Game client', 'Session engine', 'Daily missions', 'Rewards', 'Persistence'],
      stack: ['Python', 'JavaScript', 'PostgreSQL', 'Canvas', 'Docker'],
      signals: ['Once-only reward claims', 'Reduced-motion UX', 'Server-side validation', 'Persistent missions']
    },
    {
      id: 'cargopulse', title: 'CargoPulse',
      repo: 'https://github.com/DizzyZ7/CargoPulse', category: 'platform',
      domain: 'Logistics / .NET Platform', status: 'PUBLIC · Foundation milestone only',
      year: '2026', featured: false, private: false, accent: '#78bef6',
      summary: '.NET 10 foundation for a logistics shipment-exception control tower; shipment and SLA workflows are roadmap, not yet implemented.',
      problem: 'Carrier events are inconsistent and operations teams need an explainable route to incident state and shipment risk.',
      architecture: ['API foundation', 'Worker', 'Aspire', 'PostgreSQL infra', 'RabbitMQ infra', 'Telemetry'],
      stack: ['C#', '.NET 10', 'Blazor', 'Aspire', 'PostgreSQL', 'RabbitMQ'],
      signals: ['OpenTelemetry baseline', 'Worker heartbeat', 'CI / CodeQL', 'Honest milestone boundaries']
    }
  ];
  for (const project of furtherSystems) {
    if (!list.some(existing => existing.id === project.id)) list.push(project);
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

    const publicSafeRussian = {
      janqor: {
        domain: 'B2B / операционная эффективность', status: 'PRIVATE · разработка пилота',
        summary: 'Система выявления операционных потерь: события, детерминированные правила, управляемые действия и проверяемый результат. Клиентское внедрение не заявляется.',
        problem: 'Данные и действия разбросаны по нескольким системам; нужен замкнутый, проверяемый процесс принятия решений.',
        architecture: ['Сбор событий', 'Изоляция клиентов', 'Правила', 'Управляемое действие', 'Outbox', 'Учет эффекта'],
        signals: ['Изоляция по tenant', 'Журнал аудита', 'Готовность и метрики', 'PostgreSQL E2E']
      },
      vinflow: {
        domain: 'Автобизнес / B2B-процессы', status: 'PRIVATE · локальный прототип пилота',
        summary: 'Прототип обработки автодокументов, OCR, проверки оператором и складских операций. Локально тестируется в CI, не готов к production.',
        problem: 'Разрозненные документы, ручные правки и неопределенные статусы автомобиля мешают контролировать сделку.',
        architecture: ['Входящие документы', 'PDF и OCR', 'Проверка человеком', 'Склад', 'Продажа', 'Аудит'],
        signals: ['Изоляция данных', 'Оригиналы файлов', 'Подтверждение оператора', 'Локальные smoke-тесты']
      },
      catoku: {
        domain: 'Telegram Mini App / логическая игра', status: 'PRIVATE · активная разработка',
        summary: 'Головоломка с котиками, серверной проверкой правил, ежедневными режимами и долгосрочным прогрессом.',
        problem: 'Короткая головоломка должна оставаться честной и интересной при повторных прохождениях.',
        architecture: ['Авторизация WebApp', 'Валидация поля', 'Прогресс', 'Сезоны', 'PostgreSQL'],
        signals: ['Проверка initData', 'Серверное состояние', 'Мобильный UX', 'Прогресс']
      },
      islumi: {
        domain: 'Telegram Mini App / игровые миры', status: 'PRIVATE · игровая тестовая сборка',
        summary: 'Персональные острова с генерацией по seed, редкостью, биомами, экспедициями и сохраняемым прогрессом.',
        problem: 'Нужны отличающиеся миры и длительная система исследования вместо однообразных кликов.',
        architecture: ['Seed острова', 'Биомы', 'Экспедиции', 'Коллекции', 'Хранение данных'],
        signals: ['Тестовое развертывание', 'Серверное состояние', 'Миграции', 'CI']
      },
      pokehub: {
        domain: 'Telegram / игровые backend-системы', status: 'PRIVATE · итерационная разработка',
        summary: 'Бот и Mini App с рейдами, коллекциями и разведением существ на общем PostgreSQL-состоянии.',
        problem: 'Параллельные операции и повторные нажатия не должны удваивать награды или списания.',
        architecture: ['Бот', 'Mini App', 'Рейды', 'Разведение', 'Защита операций', 'PostgreSQL'],
        signals: ['База как источник истины', 'Идемпотентность', 'Ограниченный поиск', 'Общие доменные сервисы']
      },
      'chain-scribe': {
        domain: 'Защищенный API / контент', status: 'PUBLIC · security-focused backend',
        summary: 'Django Ninja API для публикаций с контролем владения, жизненным циклом токенов, аудитом, rate limiting и CI.',
        problem: 'Контентные сервисы требуют строгих границ доступа и трассируемых решений.',
        architecture: ['Версионированный API', 'Авторизация', 'PostgreSQL', 'Аудит', 'Redis', 'CI'],
        signals: ['Argon2', 'Проверка владения', 'Correlation IDs', 'Тесты PostgreSQL']
      },
      'touch-grass': {
        domain: 'Telegram Mini App / интерактивная игра', status: 'PUBLIC · развитие механик',
        summary: 'IT-мемная игра с проверяемыми сессиями, ежедневными заданиями, погодными режимами и выдачей наград на сервере.',
        problem: 'Даже шуточной игре нужны последовательная логика прогресса и интересные поводы вернуться.',
        architecture: ['Игровой клиент', 'Сессии', 'Задания дня', 'Награды', 'Хранение'],
        signals: ['Однократные награды', 'Меньше анимаций по запросу', 'Серверные проверки', 'Сохранение заданий']
      },
      cargopulse: {
        domain: 'Логистика / .NET-платформа', status: 'PUBLIC · пока только фундамент',
        summary: 'Фундамент .NET 10 системы обработки логистических исключений; работа с реальными перевозками и SLA еще в плане.',
        problem: 'Разные форматы событий перевозчиков усложняют контроль статусов и рисков.',
        architecture: ['API', 'Worker', 'Aspire', 'PostgreSQL', 'RabbitMQ', 'Телеметрия'],
        signals: ['OpenTelemetry', 'Heartbeat воркера', 'CI / CodeQL', 'Честные границы MVP']
      }
    };
    for (const [id, ru] of Object.entries(publicSafeRussian)) {
      window.ATLAS_I18N.projects[id] = { ru };
    }

  }
})();