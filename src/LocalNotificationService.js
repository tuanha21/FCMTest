import PushNotification from "react-native-push-notification";
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import { Platform } from 'react-native';

class LocalNotificationService {
    configure = (onOpenNotification) => {
        PushNotification.configure({
            onRegister: function(token) {
                console.log('[LNS] onRegistry', token)
            },
            onNotification: function(notification) {
                console.log('[LNS] onNotification: ', notification);
                if(!notification?.data) {
                    return
                }
                notification.userInteraction = true;
                onOpenNotification(Platform.OS === 'ios' ? notification.data.item : notification.data);
                if(Platform.OS === 'ios') {
                    notification.finish(PushNotificationIOS.FetchResult.NoData)
                }
            },

            permissions: {
                alert: true,
                badge: true,    
                sound: true,
            },

            popInitialNotification: true,
            requestPermissions: true,
        })
    }
    unRegister = () => {
        PushNotification.unregister()
    }

    showNotification = (id, title, message, data ={}, options = {}) => {
        PushNotification.localNotification({
            ...this.buildAndroidNotification(id, title, message, data, options),
            ...this.buildIOSNotification(id , title, message, data, options),
            title: title || "",
            message: message || "",
            playSound: options.playSound || false,
            soundName: options.soundName || 'default',
            userInteraction: false
        });
    }

    buildAndroidNotification = (id , title, message, data = {}, options = {}) => {
        return{
            id:id,
            autoCancel: true,
            largeIcon: options.largeIcon || "ic_launcher",
            smallIcon: options.smallIcon || "ic_notification",
            bigText: message || '',
            subText: title || '',
            vibrate: options.vibrate || true,
            vibration: options.vibration || 300,
            priority: options.priority || 'high',
            importance: options.importance || "high",
            data: data,
        }
    }

    buildIOSNotification = (id, title, message, data = {}, options = {}) => {
        return {
            alertAction: options.alertAction || 'view',
            category: options.category || "",
            userInfo: {
                id: id,
                item: data
            }
        }
    }

    cancelAllLocalNotification = () => {
        if(Platform.OS === 'ios') {
            PushNotificationIOS.removeAllDeliveredNotifications();
        } else {
            PushNotification.cancelAllLocalNotifications();
        }        
    }

    removeDeliveredNotificationByID = (notificationID) => {
        console.log('removeID: ', notificationID)
        PushNotification.cancelLocalNotifications({id: `${notificationID}`})
    }
}

export const localNotificationService = new LocalNotificationService()