import React, { createContext, useEffect, useState } from "react";

interface Props {
  children?: React.ReactNode;
}

interface State {
  // TODO: store all data from backend here
}

const blankState: State = {};

export const GlobalContext = createContext(blankState);

export const GlobalState: React.FunctionComponent = (props: Props) => {
  const { children } = props;

  useEffect(() => {
    (async () => {
      // TODO: download data - schedujes, jobs, etc.
    })();
  }, []);

  return <GlobalContext.Provider value={{}}>{children}</GlobalContext.Provider>;
};
