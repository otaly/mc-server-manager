import { MainLayout } from './components/Layout';
import { AppProvider } from './providers/app';

const App = () => (
  <AppProvider>
    <MainLayout>contents</MainLayout>
  </AppProvider>
);

export default App;
