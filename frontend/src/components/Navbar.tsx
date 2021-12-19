import React from "react";
import { Button, Menu } from "antd";
import {
  CalendarOutlined,
  DesktopOutlined,
  OrderedListOutlined,
  ReadOutlined,
  RetweetOutlined,
  SettingOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { SelectInfo } from "rc-menu/lib/interface";

export const menuItems = {
  Jobs: RetweetOutlined,
  Schedules: CalendarOutlined,
  Tasks: OrderedListOutlined,
  Logs: ReadOutlined,
  Machines: DesktopOutlined,
  Users: TeamOutlined,
  Settings: SettingOutlined,
};

export type MenuItemsKeys = keyof typeof menuItems;

const MenuItems = Object.keys(menuItems).map((item) => {
  const Icon = menuItems[item as MenuItemsKeys];
  return (
    <Menu.Item key={item} icon={<Icon />}>
      {item}
    </Menu.Item>
  );
});

type Props = { onSelect: (e: SelectInfo) => void };

export const Navbar = (props: Props) => {
  return (
    <>
      <Menu
        theme="dark"
        mode="horizontal"
        defaultSelectedKeys={[Object.keys(menuItems)[0]]}
        onSelect={props.onSelect}
      >
        <>{MenuItems}</>
      </Menu>
      <Button
        disabled
        danger
        type={"primary"}
        style={{ right: "16px", marginTop: "-48px", position: "absolute" }}
      >
        Logout
      </Button>
    </>
  );
};
