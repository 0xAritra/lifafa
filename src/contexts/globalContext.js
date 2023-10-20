import useMessage from "antd/es/message/useMessage";
import useNotification from "antd/es/notification/useNotification";

const { createContext, useState } = require("react");

const GlobalContext = createContext();

const GlobalContextProvider = (props) => {
    const [message, messageProvider] = useMessage();
    const [notification, notificationProvider] = useNotification();
    const [historyData, setHistoryData] = useState([]);
    const [historyReload, setHistoryReload] = useState(false);
    
    const history = {
        set: (data) => {
            setHistoryData(data);
        },
        get: () => {
            return historyData;
        },
        reload: {
            set: (value) => {
                setHistoryReload(value);
            },
            get: () => {
                return historyReload;
            }
        }
    }

    return (
        <GlobalContext.Provider value={{ message, notification, history }}>
            {props.children}
            {messageProvider}
            {notificationProvider}
        </GlobalContext.Provider>
    )
}

export { GlobalContext, GlobalContextProvider };