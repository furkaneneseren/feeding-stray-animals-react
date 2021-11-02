import './App.css';
import Navbar from './components/navbar';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Home from './components/pages/home';
import Login from './components/pages/login';
import SignUp from './components/pages/signup';
import Map from './components/pages/map';

function App() {
  return (
    <div className="background">
      <Router>
        <Navbar />
        <div className="pages" id="pages_background">
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/map" component={Map} />
            <Route path="/login" component={Login} />
            <Route path="/signup" component={SignUp} />
          </Switch>
        </div>
      </Router>
    </div>
  );
}
export default App;