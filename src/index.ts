import app from './app';

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => console.log(`app running on PORT :::> ${PORT}`));
export default server;
