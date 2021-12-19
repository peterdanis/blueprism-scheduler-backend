import React, { forwardRef } from "react";
import CustomModal from "../CustomModal";
import fetchApi from "../../services/fetchApi";
import notification from "../../utils/notification";

type Props = {
  id: number;
};

const RunModal = forwardRef(({ id }: Props, ref) => {
  const onOkHandler = async () => {
    const url = `/api/jobs/`;
    const result = await fetchApi(url, "POST", { scheduleId: id });
    if (result) {
      notification("Schedule inserted into queue", undefined, "success", 6);
    }
  };

  return (
    <CustomModal
      key="RunModal"
      okFn={onOkHandler}
      okButtonName="Start"
      cancelButtonName="Cancel"
      ref={ref}
    >
      <h3>Start schedule</h3>
    </CustomModal>
  );
});

export default RunModal;
