import "antd/dist/antd.css";
import { GlobalState } from "./GlobalState";
import { Layout } from "antd";
import { Navbar } from "./Navbar";
import Jobs from "./Jobs";
import Logs from "./Logs";
import Machines from "./Machines";
import React, { useEffect, useState } from "react";
import Schedules from "./Schedules";
import Settings from "./Settings";
import Tasks from "./Tasks";
import Users from "./Users";

const { Header, Content } = Layout;

const App = () => {
  const [key, setKey] = useState("jobs");
  const [component, setComponent] = useState(<Jobs />);

  useEffect(() => {
    switch (key) {
      case "Jobs":
        setComponent(<Jobs />);
        break;
      case "Machines":
        setComponent(<Machines />);
        break;
      case "Schedules":
        setComponent(<Schedules />);
        break;
      case "Settings":
        setComponent(<Settings />);
        break;
      case "Logs":
        setComponent(<Logs />);
        break;
      case "Tasks":
        setComponent(<Tasks />);
        break;
      case "Users":
        setComponent(<Users />);
        break;
      default:
        break;
    }
  }, [key]);

  return (
    <GlobalState>
      <Layout className="layout" style={{ height: "100%" }}>
        <Header>
          <Navbar
            onSelect={(e) => {
              setKey(e.key as string);
            }}
          />
        </Header>
        <Content style={{ height: "100%", margin: "24px" }}>
          {component}
        </Content>
      </Layout>
    </GlobalState>
  );
};

export default App;
