/* eslint-disable promise/no-nesting */
/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

// This optional code is used to register a service worker.
// register() is not called by default.

// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on subsequent visits to a page, after all the
// existing tabs open on the page have been closed, since previously cached
// resources are updated in the background.

// To learn more about the benefits of this model and instructions on how to
// opt-in, read https://bit.ly/CRA-PWA

const localhostRegex =
  // eslint-disable-next-line security/detect-unsafe-regex
  /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/u;
const isLocalhost: boolean =
  window.location.hostname === 'localhost' ||
  // [::1] is the IPv6 localhost address.
  window.location.hostname === '[::1]' ||
  // 127.0.0.1/8 is considered localhost for IPv4.
  localhostRegex.test(window.location.hostname);

type Config = Readonly<{
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
}>;

export function register(config?: Config): void {
  if (
    process.env.NODE_ENV === 'production' &&
    // eslint-disable-next-line no-restricted-syntax
    'serviceWorker' in window.navigator
  ) {
    // The URL constructor is available in all browsers that support SW.
    const PUBLIC_URL = (process as { env: Record<string, string> }).env[
      'PUBLIC_URL'
    ];
    if (PUBLIC_URL === undefined) return;
    const publicUrl = new URL(PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      // Our service worker won't work if PUBLIC_URL is on a different origin
      // from what our page is served on. This might happen if a CDN is used to
      // serve assets; see https://github.com/facebook/create-react-app/issues/2374
      return;
    }

    window.addEventListener('load', () => {
      const public_url = process.env.PUBLIC_URL;
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (public_url === undefined) return;
      const swUrl = `${public_url}/service-worker.js`;

      if (isLocalhost) {
        // This is running on localhost. Let's check if a service worker still exists or not.
        checkValidServiceWorker(swUrl, config);

        // Add some additional logging to localhost, pointing developers to the
        // service worker/PWA documentation.
        window.navigator.serviceWorker.ready
          .then(() => {
            console.log(
              'This web app is being served cache-first by a service ' +
                'worker. To learn more, visit https://bit.ly/CRA-PWA'
            );
          })
          .catch(console.error);
      } else {
        // Is not localhost. Just register service worker
        registerValidSW(swUrl, config).catch(console.error);
      }
    });
  }
}

async function registerValidSW(swUrl: string, config?: Config): Promise<void> {
  const mut_registration = await window.navigator.serviceWorker
    .register(swUrl)
    .catch((error) => {
      console.error('Error during service worker registration:', error);
      return undefined;
    });

  if (mut_registration === undefined) return;
  console.log(
    'ServiceWorker registration successful with scope: ',
    mut_registration.scope
  );

  mut_registration.addEventListener('updatefound', () => {
    const mut_installingWorker = mut_registration.installing;
    if (mut_installingWorker == null) {
      return;
    }
    mut_installingWorker.addEventListener('statechange', () => {
      if (mut_installingWorker.state === 'installed') {
        if (window.navigator.serviceWorker.controller !== null) {
          // At this point, the updated precached content has been fetched,
          // but the previous service worker will still serve the older
          // content until all client tabs are closed.
          console.log(
            'New content is available and will be used when all ' +
              'tabs for this page are closed. See https://bit.ly/CRA-PWA.'
          );

          // Execute callback
          if (config?.onUpdate !== undefined) {
            config.onUpdate(mut_registration);
          }
        } else {
          // At this point, everything has been precached.
          // It's the perfect time to display a
          // "Content is cached for offline use." message.
          console.log('Content is cached for offline use.');

          // Execute callback
          if (config?.onSuccess !== undefined) {
            config.onSuccess(mut_registration);
          }
        }
      }
    });
  });
}

function checkValidServiceWorker(swUrl: string, config?: Config): void {
  // Check if the service worker can be found. If it can't reload the page.
  fetch(swUrl)
    .then((response) => {
      // Ensure service worker exists, and that we really are getting a JS file.
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        contentType?.includes('javascript') === true
      ) {
        // No service worker found. Probably a different app. Reload the page.
        window.navigator.serviceWorker.ready
          .then((registration) =>
            registration.unregister().then(() => {
              window.location.reload();
            })
          )
          .catch(console.error);
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl, config).catch(console.error);
      }
    })
    .catch(() => {
      console.log(
        'No internet connection found. App is running in offline mode.'
      );
    });
}

export function unregister(): void {
  if (
    // eslint-disable-next-line no-restricted-syntax
    'serviceWorker' in window.navigator
  ) {
    window.navigator.serviceWorker.ready
      .then((registration) => registration.unregister())
      .catch(console.error);
  }
}