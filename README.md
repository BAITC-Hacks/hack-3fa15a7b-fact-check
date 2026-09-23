# Fact Check

HackAlem AI · трек «Креативные индустрии».

Мобильное приложение для умного подбора event-подрядчиков: до трёх рекомендаций с конкретными объяснениями выбора.

Frontend находится в [`frontend/`](frontend/README.md): React Native + Expo development build, NativeWind, JavaScript/JSX, Zustand, Axios и Lucide.

```sh
cd frontend
npm i
npx expo run:ios --device # или npx expo run:android --device
```

Подключение готового backend описано в [контракте адаптера](frontend/docs/api-contract.md).

## Backend

Node.js 22+, без внешних npm-зависимостей. Из корня репозитория:

```sh
cd backend
npm start
```

Сервер читает `backend/src/data/contractors.json`. API: `GET /health`, `GET /catalog`, `POST /recommendations`. По умолчанию порт 3000.

Во втором терминале настройте `frontend/.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_RECOMMENDATIONS_PATH=/recommendations
```

`localhost` подходит для web и iOS Simulator. Для Android Emulator используйте `http://10.0.2.2:3000`, для физического телефона — LAN IP компьютера. После изменения `.env` перезапустите Expo.

Документация backend: [backend/README.md](backend/README.md). Обе части находятся в ветке `main`; исходные ветки сохранены.
