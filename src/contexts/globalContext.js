import useMessage from "antd/es/message/useMessage";
import useNotification from "antd/es/notification/useNotification";

const { createContext, useState } = require("react");

const GlobalContext = createContext();

const GlobalContextProvider = (props) => {
    const [message, messageProvider] = useMessage();
    const [notification, notificationProvider] = useNotification();

    return (
        <GlobalContext.Provider value={{ message, notification }}>
            {props.children}
            {messageProvider}
            {notificationProvider}
        </GlobalContext.Provider>
    )
}

export { GlobalContext, GlobalContextProvider };