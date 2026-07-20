self.addEventListener('push', e => {
  const data = e.data.json();
  console.log('Push received...', data);
  
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icon.png', // Assuming an icon exists, or fallback to default
    data: data.url
  });
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  // Focus the window if it's open, or open a new one
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return clients.openWindow('/');
    })
  );
});
