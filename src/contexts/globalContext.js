const { createContext, useState } = require("react");

const GlobalContext = createContext();

const GlobalContextProvider = (props) => {
    const [toggle, setToggle] = useState(false);

    return (
        <GlobalContext.Provider value={{ toggle, setToggle }}>
            {props.children}
        </GlobalContext.Provider>
    )
}

export { GlobalContext, GlobalContextProvider };