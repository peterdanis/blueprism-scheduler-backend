import React, { forwardRef, useState } from "react";
import CustomModal from "./CustomModal";
import fetchApi from "../services/fetchApi";
import notification from "../utils/notification";

type Props = {
  id: number;
  route: string;
  loadData: () => void;
  customText?: string;
  customButtonName?: string;
  customNotificationText?: string;
};

const DeleteModal = forwardRef(
  (
    {
      id,
      route,
      loadData,
      customButtonName,
      customNotificationText,
      customText,
    }: Props,
    ref
  ) => {
    const onOkHandler = async () => {
      const url = `${route}/${id}`;
      const result = await fetchApi(url, "DELETE", { id });
      if (result) {
        notification(
          customNotificationText || "Deleted",
          undefined,
          "success",
          6
        );
        loadData();
      }
    };

    return (
      <CustomModal
        key="DeleteModal"
        okFn={onOkHandler}
        okButtonName={customButtonName || "Delete"}
        cancelButtonName="Cancel"
        ref={ref}
        danger={true}
      >
        <h3>{customText || "Confirm deleting"}</h3>
      </CustomModal>
    );
  }
);

export default DeleteModal;
