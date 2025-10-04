import './style.css';
import { App } from './App';

const app = document.getElementById('app');
if (app) {
  app.innerHTML = App();
}