/// <reference types="vite/client" />

interface Window {
  Telegram?: {
    WebApp: {
      initDataUnsafe: {
        user: {
          id: number;
          username?: string;
        };
      };
      showPopup: (params: {
        title: string;
        message: string;
        buttons: Array<{ type: string }>;
      }) => void;
      connectWallet: () => Promise<string>;
    };
  };
}