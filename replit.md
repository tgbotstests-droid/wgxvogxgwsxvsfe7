# Flash Loan Arbitrage Bot - Полная документация

## 📋 Описание проекта

Профессиональный Flash Loan арбитражный бот для криптовалютной торговли на Polygon с использованием Aave flash loans. Полный клон репозитория GitHub с real-time мониторингом, управлением ботом и детальным логированием.

## 🏗️ Архитектура

### Frontend (React + TypeScript + Vite)
- **Роутинг**: Wouter
- **UI Framework**: Shadcn UI + Tailwind CSS + Radix UI
- **State Management**: TanStack Query (React Query v5)
- **Real-time**: WebSocket для live обновлений
- **Темы**: Dark/Light mode с next-themes

### Backend (Node.js + Express + TypeScript)
- **Database**: PostgreSQL (Neon) + Drizzle ORM
- **Blockchain**: Ethers.js для Polygon/Ethereum
- **Flash Loans**: Aave V3 Protocol
- **DEX**: 1inch API Aggregator, GeckoTerminal
- **WebSocket**: Real-time broadcast для всех клиентов

### Blockchain интеграция
- **Network**: Polygon Mainnet + Amoy Testnet
- **Flash Loans**: Aave V3 Protocol
- **DEX Aggregation**: 1inch API
- **Price Feeds**: GeckoTerminal API
- **Multisig**: Gnosis Safe (опционально)
- **Hardware Wallet**: Ledger support (опционально)

## 📁 Структура проекта

```
├── client/
│   ├── src/
│   │   ├── components/     # React компоненты
│   │   │   ├── ui/         # Shadcn UI компоненты (50+ компонентов)
│   │   │   ├── activity-feed.tsx
│   │   │   ├── bot-controls.tsx
│   │   │   ├── error-chart.tsx
│   │   │   ├── flash-loan-panel.tsx
│   │   │   ├── open-positions-panel.tsx
│   │   │   ├── performance-analytics.tsx
│   │   │   ├── potential-opportunities-panel.tsx
│   │   │   ├── telegram-messages-panel.tsx
│   │   │   └── token-whitelist-manager.tsx
│   │   ├── pages/          # Страницы приложения
│   │   │   ├── dashboard.tsx       # Главная панель управления
│   │   │   ├── settings.tsx        # Настройки бота
│   │   │   ├── ledger.tsx          # Ledger управление
│   │   │   ├── safe.tsx            # Gnosis Safe мультисиг
│   │   │   ├── wallet.tsx          # Кошелёк и балансы
│   │   │   ├── trade.tsx           # Торговая панель
│   │   │   ├── transactions.tsx    # История транзакций
│   │   │   ├── documentation.tsx   # Документация API
│   │   │   └── risk-management.tsx # Риск-менеджмент
│   │   ├── lib/            # Утилиты
│   │   │   ├── queryClient.ts  # TanStack Query setup
│   │   │   ├── utils.ts        # Helper функции
│   │   │   ├── ledgerClient.ts # Ledger интеграция
│   │   │   └── safeClient.ts   # Gnosis Safe клиент
│   │   ├── App.tsx         # Главный компонент с роутингом
│   │   ├── main.tsx        # Entry point
│   │   └── index.css       # Глобальные стили + Tailwind
│   └── index.html
│
├── server/
│   ├── aaveFlashLoan.ts        # Aave V2 flash loan executor
│   ├── aaveFlashLoanV3.ts      # Aave V3 flash loan executor
│   ├── dexAggregator.ts        # 1inch + GeckoTerminal интеграция
│   ├── opportunityScanner.ts   # Сканер арбитражных возможностей
│   ├── telegram.ts             # Telegram API клиент
│   ├── telegramBot.ts          # Telegram bot commands
│   ├── telegramConfig.ts       # Telegram конфигурация
│   ├── tradeExecutor.ts        # Торговый executor
│   ├── web3Provider.ts         # Web3/Ethers.js провайдер
│   ├── routes.ts               # API маршруты (1285 строк)
│   ├── storage.ts              # Database storage layer (839 строк)
│   ├── db.ts                   # Drizzle database connection
│   ├── index.ts                # Express server entry
│   └── vite.ts                 # Vite dev server setup
│
├── shared/
│   └── schema.ts               # Drizzle ORM схема (620 строк)
│
├── contracts/
│   ├── ArbitrageExecutor.sol   # Solidity контракт для арбитража
│   └── README.md               # Инструкции по деплою контрактов
│
└── design_guidelines.md        # Дизайн система интерфейса
```

## 🗄️ База данных (PostgreSQL)

### Основные таблицы

1. **users** - Пользователи системы
2. **bot_config** - Конфигурация бота (RPC, API ключи, параметры торговли)
3. **bot_status** - Текущее состояние бота (running, paused, метрики)
4. **ledger_status** - Статус Ledger устройства
5. **safe_transactions** - Gnosis Safe мультисиг транзакции
6. **arbitrage_transactions** - История арбитражных сделок
7. **connected_wallets** - Подключённые кошельки (MetaMask и т.д.)
8. **activity_logs** - Real-time активность системы
9. **telegram_messages** - История Telegram уведомлений
10. **open_positions** - Активные позиции с unrealized P&L
11. **error_logs** - Детальное логирование ошибок по категориям
12. **bot_performance** - Метрики производительности (hourly/daily)
13. **token_whitelist** - Белый список токенов для торговли
14. **webhook_configs** - Webhooks для внешних уведомлений

### Применение схемы

```bash
npm run db:push
```

## 🚀 Запуск приложения

### Development mode
```bash
npm run dev
```

Приложение доступно на **http://localhost:5000**

### Production build
```bash
npm run build
npm start
```

## 🔧 Конфигурация

### Переменные окружения

Все настройки хранятся в базе данных в таблице `bot_config`:

#### Network & RPC
- `networkMode`: mainnet / testnet
- `polygonRpcUrl`: Polygon RPC endpoint
- `polygonTestnetRpcUrl`: Amoy testnet RPC

#### Wallets (Encrypted)
- `privateKey`: Приватный ключ основного кошелька
- `safeSigner2Key`: Приватный ключ второго подписанта Safe

#### Trading Parameters
- `minProfitPercent`: Минимальный процент профита (default: 0.3%)
- `minNetProfitPercent`: Минимальный чистый профит после газа (0.15%)
- `flashLoanAmount`: Размер flash loan в USD (10,000)
- `scanInterval`: Интервал сканирования в секундах (30)

#### API Keys
- `oneinchApiKey`: 1inch API ключ
- `polygonscanApiKey`: Polygonscan API ключ
- `geckoTerminalEnabled`: Использовать GeckoTerminal API

#### Telegram
- `telegramBotToken`: Telegram Bot Token
- `telegramChatId`: Chat ID для уведомлений

#### Safety & Limits
- `maxLoanUsd`: Максимальный loan в USD (50,000)
- `dailyLossLimit`: Дневной лимит потерь (500 USD)
- `maxSingleLossUsd`: Максимальная потеря на сделку (100 USD)
- `emergencyPauseDrawdownPercent`: Авто-пауза при просадке (1%)
- `autoPauseEnabled`: Автоматическая пауза при потерях

#### Gas Settings
- `maxGasPriceGwei`: Максимальная цена газа (60 gwei)
- `priorityFeeGwei`: Priority fee (1.5 gwei)
- `baseFeeMultiplier`: Множитель base fee (1.125)

## 📡 API Endpoints

### Bot Management
- `GET /api/bot/status` - Текущий статус бота
- `GET /api/bot/config` - Конфигурация
- `POST /api/bot/start` - Запустить бота
- `POST /api/bot/stop` - Остановить бота
- `POST /api/bot/emergency-stop` - Экстренная остановка
- `PATCH /api/bot/config` - Обновить конфигурацию

### Trading
- `POST /api/trade/execute-swap` - Выполнить swap
- `POST /api/trade/execute-arbitrage` - Выполнить арбитраж
- `GET /api/trade/estimate-gas` - Оценка газа

### Flash Loans
- `POST /api/flashloan/execute` - Выполнить flash loan
- `POST /api/flashloan/simulate` - Симуляция flash loan

### Opportunities
- `GET /api/scanner/opportunities` - Текущие арбитражные возможности
- `POST /api/scanner/scan-token-pair` - Сканировать пару токенов

### Positions
- `GET /api/positions/open` - Открытые позиции
- `POST /api/positions` - Создать позицию
- `PATCH /api/positions/:id` - Обновить позицию
- `DELETE /api/positions/:id/close` - Закрыть позицию

### Analytics
- `GET /api/analytics/performance` - Метрики производительности
- `GET /api/analytics/pnl` - Profit & Loss статистика
- `GET /api/analytics/error-stats` - Статистика ошибок

### Transactions
- `GET /api/arbitrage/transactions` - История арбитражных транзакций
- `GET /api/safe/transactions` - Gnosis Safe транзакции
- `POST /api/safe/propose` - Предложить Safe транзакцию

### Wallet Management
- `GET /api/wallet/balances` - Балансы кошелька
- `GET /api/wallet/connected` - Подключённые кошельки
- `POST /api/wallet/connect` - Подключить кошелёк

### Telegram
- `GET /api/telegram/messages` - История сообщений
- `POST /api/telegram/send` - Отправить сообщение
- `POST /api/telegram/test-connection` - Тестировать подключение

### Logs & Activity
- `GET /api/activity-logs` - Лог активности
- `POST /api/activity-logs` - Создать запись
- `GET /api/error-logs` - Логи ошибок
- `POST /api/error-logs` - Записать ошибку

## 🔌 WebSocket Events

Все real-time обновления транслируются через WebSocket на `/ws`

### Events
- `connected` - Подтверждение подключения
- `bot_status_update` - Обновление статуса бота
- `swap_executed` - Выполнен swap
- `activity_log` - Новая запись активности
- `position_opened` - Открыта позиция
- `position_updated` - Обновлена позиция
- `position_closed` - Закрыта позиция
- `flashloan_executed` - Выполнен flash loan
- `opportunity_found` - Найдена арбитражная возможность

## 🎨 Интерфейс

### Главные страницы

1. **Dashboard** (`/`) - Главная панель с метриками, статусом бота, графиками
2. **Settings** (`/settings`) - Полная конфигурация бота
3. **Wallet** (`/wallet`) - Управление кошельками и балансами
4. **Trade** (`/trade`) - Ручная торговая панель
5. **Transactions** (`/transactions`) - История всех транзакций
6. **Ledger** (`/ledger`) - Управление Ledger устройством
7. **Safe** (`/safe`) - Gnosis Safe мультисиг менеджмент
8. **Risk Management** (`/risk-management`) - Управление рисками
9. **Documentation** (`/documentation`) - API документация

### UI Компоненты

- **Bot Controls** - Start/Stop/Emergency Stop с индикаторами
- **Activity Feed** - Real-time лог активности с WebSocket
- **Performance Analytics** - Графики PnL, Success Rate, Win/Loss
- **Potential Opportunities** - Live арбитражные возможности
- **Flash Loan Panel** - Панель управления flash loans
- **Open Positions** - Активные позиции с unrealized P&L
- **Error Chart** - Визуализация ошибок по категориям
- **Telegram Messages** - История Telegram уведомлений
- **Token Whitelist Manager** - Управление белым списком токенов

## 🔐 Безопасность

### Текущий режим: DEMO MODE
- Используется демо-пользователь `demo-user-1`
- Симуляция торговли по умолчанию (`useSimulation: true`)
- Real trading отключен (`enableRealTrading: false`)

### Для Production:
1. Настроить Replit Auth для реальных пользователей
2. Включить шифрование приватных ключей
3. Настроить Gnosis Safe для мультисиг
4. Подключить Ledger для hardware signing
5. Установить лимиты и stop-loss
6. Настроить Telegram уведомления

## 📦 Установленные пакеты

### Blockchain & Web3
- `ethers@6.15.0` - Ethereum library
- `@neondatabase/serverless` - PostgreSQL для Neon

### API & HTTP
- `axios` - HTTP клиент
- `express` - Web framework
- `ws` - WebSocket server

### Database
- `drizzle-orm` - TypeScript ORM
- `drizzle-kit` - Migrations tool
- `drizzle-zod` - Zod schema validation

### UI Framework
- `react` + `react-dom` - React 18
- `wouter` - Lightweight router
- `@tanstack/react-query` - Data fetching
- `lucide-react` - Icons
- `recharts` - Charts library
- `framer-motion` - Animations
- `next-themes` - Dark mode

### Shadcn UI (50+ компонентов)
- Form, Dialog, Sheet, Drawer
- Card, Button, Badge, Avatar
- Accordion, Tabs, Collapsible
- Chart, Calendar, Progress
- И многие другие...

### Telegram
- `node-telegram-bot-api` - Telegram Bot API

### Utils
- `papaparse` - CSV парсинг для экспорта
- `date-fns` - Работа с датами
- `zod` - Schema validation
- `class-variance-authority` - Component variants
- `tailwind-merge` - Tailwind class merging

## 🐛 Отладка

### Логи сервера
```bash
# Просмотр логов в workflow "Start application"
```

### Browser console
- WebSocket события логируются в консоль
- React Query devtools доступны в development

### Database queries
- Используйте execute_sql_tool для прямых SQL запросов
- Drizzle Studio: `npx drizzle-kit studio`

## 📝 TODO для Production

- [ ] Настроить Replit Auth вместо demo-user
- [ ] Добавить environment secrets (PRIVATE_KEY, API_KEYS)
- [ ] Деплоить smart contracts на Polygon
- [ ] Настроить Telegram Bot Token
- [ ] Включить real trading после тестирования
- [ ] Настроить Gnosis Safe мультисиг
- [ ] Подключить Ledger hardware wallet
- [ ] Настроить webhooks для уведомлений
- [ ] Добавить rate limiting на API
- [ ] Настроить monitoring и alerts

## 🔗 Полезные ссылки

- **Aave V3 Docs**: https://docs.aave.com/developers/
- **1inch API**: https://docs.1inch.io/
- **GeckoTerminal**: https://www.geckoterminal.com/
- **Gnosis Safe**: https://docs.safe.global/
- **Ledger SDK**: https://developers.ledger.com/
- **Polygon Docs**: https://docs.polygon.technology/

---

**Версия**: 1.0.0  
**Последнее обновление**: 31 октября 2025  
**Статус**: ✅ Полностью клонирован из GitHub и работает
