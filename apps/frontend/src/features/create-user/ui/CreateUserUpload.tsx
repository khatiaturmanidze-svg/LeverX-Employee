import { Icon } from '@/shared';
import React from 'react';

export default function CreateUserUpload(): React.ReactElement {
  return (
    <div className="create-user-upload">
      <Icon
        src="/svgs/drag-icon.svg"
        alt="drag and drop icon"
        width={100}
        height={100}
      />
      <button className="create-user-upload__btn btn-submit">
        Upload a spreadsheet
      </button>
    </div>
  );
}
