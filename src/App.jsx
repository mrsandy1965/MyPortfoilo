import React from 'react'
import { Dock, Home, Navbar, Welcome, LoadingScreen} from '#components'
import { TerminalWindow, SafariWindow, ContactWindow, FinderWindow, ResumeWindow, TxtFileWindow, ImgFileWindow, PhotosWindow, AdminWindow } from '#windows'
import useContentStore from './store/content'
import useLocationStore from './store/location'

const App = () => {
  const { fetchContent, locations } = useContentStore();
  const { activeLocation, setActiveLocation } = useLocationStore();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const init = async () => {
      // Start fetch and minimum timer in parallel
      const minLoadTime = new Promise(resolve => setTimeout(resolve, 2000));
      await Promise.all([fetchContent(), minLoadTime]);
      setLoading(false);
    };
    init();
  }, [fetchContent]);

  // Sync activeLocation with fresh data when content is fetched
  React.useEffect(() => {
    if (!loading && activeLocation && locations.work && activeLocation.id === locations.work.id) {
       setActiveLocation(locations.work);
    }
  }, [loading, locations.work, activeLocation, setActiveLocation]);

  if (loading) return <LoadingScreen />;

  return (
    <main>
      <Navbar />
      <Welcome />
      <Dock />

      <TerminalWindow />
      <SafariWindow />
      <ContactWindow />
      <FinderWindow />
      <ResumeWindow />
      <TxtFileWindow />
      <ImgFileWindow />
      <PhotosWindow />
      <AdminWindow />
      <Home />
    </main>
  )
}

export default App
