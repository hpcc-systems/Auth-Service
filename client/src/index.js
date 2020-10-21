import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'antd/dist/antd.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { createStore, applyMiddleware } from "redux";
import thunk from 'redux-thunk';
import rootReducer from './redux/reducers'
import {Provider} from 'react-redux'
import { BrowserRouter } from 'react-router-dom';

const store = createStore(
  rootReducer,
  applyMiddleware(thunk)
)

ReactDOM.render(
  <Provider store={store}>
	  <React.StrictMode>		  
		    <App />		    
	  </React.StrictMode>,
	</Provider>,  
  document.getElementById('root')
);

serviceWorker.unregister();
