import notification from "../utils/notification";
import { Button, Modal } from "antd";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import catchAndNotify from "../utils/catchAndNotify";

type Props = {
  children?: React.ReactNode | React.ReactNode[];
  okFn: Function;
  cancelFn?: Function;
  okButtonName?: string;
  cancelButtonName?: string;
  title?: string;
  okButtonDisabled?: boolean;
  danger?: boolean;
  width?: number;
};

const CustomModal = forwardRef((props: Props, ref) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isOkLoading, setIsOkLoading] = useState(false);
  const [isCancelLoading, setIsCancelLoading] = useState(false);

  useImperativeHandle(ref, () => ({
    showModal: () => {
      setIsModalVisible(true);
    },
  }));

  const handleOk = async () => {
    setIsOkLoading(true);
    try {
      if (props.okFn) {
        await props.okFn();
      }
    } catch (error) {
      catchAndNotify(error);
    } finally {
      setIsOkLoading(false);
      setIsModalVisible(false);
    }
  };

  const handleCancel = async () => {
    setIsCancelLoading(true);
    try {
      if (props.cancelFn) {
        await props.cancelFn();
      }
    } catch (error) {
      catchAndNotify(error);
    } finally {
      setIsCancelLoading(false);
      setIsModalVisible(false);
    }
  };
  return (
    <Modal
      destroyOnClose={true}
      maskClosable={false}
      title={props.title}
      visible={isModalVisible}
      onOk={handleOk}
      onCancel={handleCancel}
      closable={false}
      width={props.width}
      footer={[
        <Button
          key="back"
          loading={isCancelLoading}
          onClick={handleCancel}
          disabled={isOkLoading}
        >
          {props.cancelButtonName || "Cancel"}
        </Button>,
        <Button
          key="submit"
          type="primary"
          danger={props.danger}
          loading={isOkLoading}
          onClick={handleOk}
          disabled={isCancelLoading || props.okButtonDisabled || false}
        >
          {props.okButtonName || "Ok"}
        </Button>,
      ]}
    >
      {props.children}
    </Modal>
  );
});

export default CustomModal;
