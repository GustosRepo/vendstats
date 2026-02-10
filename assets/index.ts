/**
 * Mascot Assets
 * Centralized exports for all mascot images
 */

export const MascotImages = {
  // App branding
  appIcon: require('./mascot/mascot-appicon.png'),
  
  // Celebrations & Success
  celebrate: require('./mascot/mascot-celebrate.png'),
  celebrate2: require('./mascot/mascot-celebrate2.png'),
  
  // At the tent/vendor booth
  tent: require('./mascot/mascot-tent.png'),
  tent2: require('./mascot/mascot-tent2.png'),
  
  // Using the phone/app
  phone: require('./mascot/mascot-phone.png'),
  happyPhone: require('./mascot/mascot-happyphone.png'),
  lookPhone: require('./mascot/mascot-lookphone.png'),
  winkPhone: require('./mascot/mascot-winkphone.png'),
  
  // Expressions
  smile: require('./mascot/mascot-smile.png'),
  wink: require('./mascot/mascot-wink.png'),
  wink2: require('./mascot/mascot-wink2.png'),
} as const;

export type MascotImageKey = keyof typeof MascotImages;
