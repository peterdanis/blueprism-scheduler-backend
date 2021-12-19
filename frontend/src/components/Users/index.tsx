import { Button, Space, Table } from "antd";
import Column from "antd/lib/table/Column";
import React, { useEffect, useRef, useState } from "react";
import fetchApi from "../../services/fetchApi";
import SearchBox from "../SearchBox";
import AddUserModal from "./AddUserModal";
import { DeleteOutlined, EditOutlined, KeyOutlined } from "@ant-design/icons";
import DeleteModal from "../DeleteModal";
import { idColumnWidth, tableSettings } from "../../utils/commonSettings";
import { User } from "../../utils/types";
import catchAndNotify from "../../utils/catchAndNotify";
import GenerateApiKeyModal from "./GenerateApiKeyModal";

const Users = () => {
  const [users, setUsers] = useState([] as User[]);
  const [filteredUsers, setFilteredUsers] = useState([] as User[]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(0);

  const AddUserModalRef = useRef<{ showModal: () => void }>(null);
  const DeleteUserModalRef = useRef<{ showModal: () => void }>(null);
  const GenerateApiKeyModalRef = useRef<{ showModal: () => void }>(null);

  const loadData = () => {
    setIsLoading(true);
    fetchApi("/api/users")
      .then((data) => {
        setIsLoading(false);
        setUsers(
          data.map((user: any) => {
            if (user && user.password) {
              user.password = "yes";
            }
            if (user && user.apiKey) {
              user.apiKey = "yes";
            }
            return user;
          })
        );
      })
      .catch(catchAndNotify);
  };

  useEffect(loadData, []);

  return (
    <>
      <AddUserModal loadData={loadData} ref={AddUserModalRef} />
      <GenerateApiKeyModal
        id={selectedUser}
        loadData={loadData}
        ref={GenerateApiKeyModalRef}
      />
      <DeleteModal
        id={selectedUser}
        route={"/api/users"}
        ref={DeleteUserModalRef}
        loadData={loadData}
      />
      <Space direction="vertical" size="large">
        <Button
          type="primary"
          onClick={() => {
            AddUserModalRef?.current?.showModal();
          }}
        >
          Add new user
        </Button>
        <SearchBox
          list={users}
          keys={["id", "name"]}
          placeholder="Search by ID or name"
          resultsSetter={setFilteredUsers}
        />
        <Table
          dataSource={filteredUsers}
          rowKey={(record) => record.id!}
          loading={isLoading}
          {...tableSettings}
        >
          <Column title="ID" dataIndex="id" width={idColumnWidth} />
          <Column title="Username" dataIndex="name" />
          <Column title="Password set" dataIndex="password" />
          <Column title="API key set" dataIndex="apiKey" />
          <Column
            title="Actions"
            dataIndex="actions"
            render={(_, record: User) => (
              <>
                <Space>
                  <Button
                    disabled
                    key={`${record.id}-edit`}
                    size="small"
                    type={"primary"}
                    icon={<EditOutlined />}
                    onClick={(e) => {
                      setSelectedUser(record.id!);
                      // DeleteUserModalRef?.current?.showModal();
                    }}
                  />
                  <Button
                    key={`${record.id}-apiKey`}
                    size="small"
                    type={"primary"}
                    icon={<KeyOutlined />}
                    onClick={(e) => {
                      setSelectedUser(record.id!);
                      GenerateApiKeyModalRef?.current?.showModal();
                    }}
                  >
                    Generate
                  </Button>
                  <Button
                    key={`${record.id}-delete`}
                    size="small"
                    danger
                    type={"primary"}
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      setSelectedUser(record.id!);
                      DeleteUserModalRef?.current?.showModal();
                    }}
                  />
                </Space>
              </>
            )}
          />
        </Table>
      </Space>
    </>
  );
};

export default Users;
