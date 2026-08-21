# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Backend (Telegram order notifications)

The `server/` folder is a small standalone Express server that receives order
submissions from the "Заказать" form and forwards them (design PNG + contact
info) to a Telegram chat via the Bot API.

Setup:

```bash
cd server
npm install
cp .env.example .env
```

Fill in `server/.env`:

```
TELEGRAM_BOT_TOKEN=<token from @BotFather>
TELEGRAM_ADMIN_CHAT_ID=<chat id that should receive orders>
```

To get these values:
1. Message [@BotFather](https://t.me/BotFather) in Telegram, send `/newbot`,
   follow the prompts — it gives you the bot token.
2. Send any message to your new bot (bots can't message first).
3. Open `https://api.telegram.org/bot<TOKEN>/getUpdates` in a browser and
   read the `chat.id` field from the response — that's your admin chat id.

Run both processes in development (two terminals):

```bash
npm start            # frontend, http://localhost:3000
cd server && npm run dev   # backend, http://localhost:4000
```

The frontend calls the backend at `REACT_APP_API_URL` (defaults to
`http://localhost:4000`); set it in a `.env` at the project root if the
backend runs elsewhere.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
