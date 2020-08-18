import messaging  from '@react-native-firebase/messaging'
import { Platform } from 'react-native'

class FCMService {

    // we use this method to register notification service in our app.
    // we call this method in componetDidMount() so, we app load we get permission to 
    // display notification.
    register = (onRegister,onNotification, onOpenNotification) =>{
        this.checkPermission(onRegister)
        // when register function call that time we create notification listener 
        this.createNoitificationListeners(onRegister, onNotification, onOpenNotification)
    }

    registerAppWithFCM = async () => {
        console.log('Platform : ', Platform.OS)
        // await messaging().registerDeviceForRemoteMessages()
        messaging().registerDeviceForRemoteMessages()
        await messaging().setAutoInitEnabled(true)    
        console.log('[FCM] isDeviceRegisteredForRemoteMessages: ', messaging().isDeviceRegisteredForRemoteMessages)
    }

    checkPermission = (onRegister) => {
    messaging().hasPermission()
        .then(enabled => {
        if (enabled) {
          //user has permission
            this.getToken(onRegister)
        } else {
          //user don't have permission
            this.requestPermission(onRegister)
        }
        }).catch(error => {
        console.log("Permission rejected", error)
        })
    }

    getToken = (onRegister) => {
        messaging().getToken()
        .then(fcmToken => {
            if (fcmToken) {
                onRegister(fcmToken)
            } else {
                console.log("[FCM] User does not have a device token")
            }
        }).catch(error => {
            console.log("[FCM] getToken rejected ", error)
        })
    }

    requestPermission = (onRegister) => {
        messaging().requestPermission()
        .then(() => {
            this.getToken(onRegister)
        }).catch(error => {
            console.log("Requested persmission rejected ", error)
        })
    }

    deletedToken = () => {
        messaging().deleteToken()
        .catch(error => {
            console.log("Delected token error ", error)
        })
    }

    createNoitificationListeners = (onRegister, onNotification, onOpenNotification) => {
    
        messaging()
        .onNotificationOpenedApp(
            remoteMessage => {
                console.log('[FCM] Notification cause app to open')
                if(remoteMessage){
                    const notification = remoteMessage.notification
                    onOpenNotification(notification)
                }
            }
        )

        messaging()
        .getInitialNotification()
        .then(remoteMessage => {
            console.log('[FCM] getInitialNotification : ', remoteMessage)
            if(remoteMessage){
                const notification = remoteMessage.notification
                onOpenNotification(notification)
            }
        })
    
        // Triggered for data only payload  in foreground 
        this.messageListener = messaging().onMessage( async remoteMessage => {
            console.log('new message arrived! ', remoteMessage)
            if(remoteMessage){
                let notification = null
                if(Platform.OS === 'ios'){
                    notification = remoteMessage.data.notification
                } else {
                    notification = remoteMessage.notification
                }
                onNotification(notification)
            }
        })

        messaging().onTokenRefresh(fcmToken => {
            console.log('new token refresh: ', fcmToken)
            onRegister(fcmToken)
        })
    }

    unRegister = () => {
        this.messageListener()
    }
}

export const fcmService = new FCMService()