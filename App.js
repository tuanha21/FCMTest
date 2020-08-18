import React, { useEffect } from 'react'
import { View, StyleSheet, Text, Button } from 'react-native'
import { fcmService } from './src/FCMService'
import { localNotificationService } from './src/LocalNotificationService'
import messaging  from '@react-native-firebase/messaging'

async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }
}

export default function App() {
  useEffect(() => {
    requestUserPermission()
    fcmService.registerAppWithFCM()
    fcmService.register(onRegister, onNotification, onOpenNotification)
    localNotificationService.configure(onOpenNotification)

    function onRegister(token){
      console.log('[App] onRegister: ', token)
    }

    function onNotification(notify){
      console.log('[App] onNotification: ', notify)
      const options = {
        soundName: 'default',
        playSound: true
      }
      localNotificationService.showNotification(
        0,
        notify.title,
        notify.body,
        notify,
        options
      )
    }

    function onOpenNotification(notify){
      console.log('[App] onOpenNotification: ', notify)
      alert('Open Notification: ' + notify.body)
    }

    return () => {
      console.log('[App] unRegister')
      fcmService.unRegister()
      localNotificationService.unRegister()
    }

  }, [])

  return(
    <View style={styles.container}>
      <Text>FCM Test</Text>
    </View>
  )

}

const styles = StyleSheet.create({
  container:{
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
})