import { Module } from '@nestjs/common';
import { firebaseProvider } from './firebase.provider';

@Module({
  providers: [firebaseProvider],
  exports: [firebaseProvider],
})
export class FirebaseModule {}
