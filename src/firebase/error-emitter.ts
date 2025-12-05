'use client';

import { EventEmitter } from 'events';

// This is a simple event emitter that is used to broadcast errors that occur in the application.
// This is used to display a custom error overlay in development mode.
export const errorEmitter = new EventEmitter();
