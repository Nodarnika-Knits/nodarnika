import React, { useRef } from 'react';
import classNames from 'classnames';
import { Form as FinalForm, Field } from 'react-final-form';

import { useConfiguration } from '../../../context/configurationContext';
import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { propTypes } from '../../../util/types';
import { required } from '../../../util/validators';

import {
  FieldTextInput,
  FieldSelect,
  FileUpload,
  Form,
  IconDisputeOrder,
  Modal,
  Button,
} from '../../../components';

import css from './DisputeModal.module.css';

const MAX_DISPUTE_FILES = 3;

export const DISPUTE_REASONS = [
  { value: 'wrong_item', labelId: 'DisputeModal.reason.wrongItem' },
  { value: 'damaged', labelId: 'DisputeModal.reason.damaged' },
  { value: 'not_as_described', labelId: 'DisputeModal.reason.notAsDescribed' },
  { value: 'not_received', labelId: 'DisputeModal.reason.notReceived' },
  { value: 'other', labelId: 'DisputeModal.reason.other' },
];

const IconAttachFile = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="none"
  >
    <path
      d="M12.309 6.03636C12.6497 6.37765 12.6497 6.93102 12.309 7.27233L7.99042 11.598C7.64969 11.9392 7.64969 12.4926 7.99042 12.8339C8.33114 13.1752 8.88358 13.1752 9.22428 12.8339L14.1598 7.89025C15.1819 6.86638 15.1819 5.20637 14.1598 4.1825C13.1376 3.15863 11.4803 3.15863 10.4581 4.1825L5.52267 9.12617C3.81905 10.8326 3.81905 13.5993 5.52267 15.3058C7.22629 17.0122 9.9884 17.0122 11.692 15.3058L16.0106 10.98C16.3513 10.6387 16.9037 10.6387 17.2445 10.98C17.5852 11.3213 17.5852 11.8746 17.2445 12.2159L12.9259 16.5417C10.5408 18.9307 6.67387 18.9307 4.2888 16.5417C1.90373 14.1526 1.90373 10.2793 4.2888 7.89025L9.22428 2.94658C10.9279 1.24014 13.6901 1.24014 15.3937 2.94658C17.0973 4.65303 17.0973 7.41972 15.3937 9.12617L10.4581 14.0699C9.43603 15.0937 7.77872 15.0937 6.75655 14.0699C5.73437 13.046 5.73437 11.386 6.75655 10.3621L11.0751 6.03638C11.4158 5.69509 11.9682 5.69508 12.309 6.03636Z"
      fill="currentColor"
    />
  </svg>
);

const DisputeForm = props => {
  const fileInputRef = useRef(null);

  return (
    <FinalForm
      {...props}
      render={fieldRenderProps => {
        const {
          className,
          rootClassName,
          disabled,
          handleSubmit,
          intl,
          formId,
          invalid,
          disputeSubmitted,
          disputeError,
          disputeInProgress,
          files = [],
          onFileUpload,
          onRemoveFile,
          onDownloadFile,
        } = fieldRenderProps;

        const classes = classNames(rootClassName || css.formRoot, className);
        const submitInProgress = disputeInProgress;
        const submitDisabled =
          invalid ||
          disabled ||
          submitInProgress ||
          disputeSubmitted ||
          files.some(f => f.uploadInProgress || f.verificationInProgress || f.error);

        const canAddMoreFiles = files.length < MAX_DISPUTE_FILES;

        const onRemoveFileAndClearInput = tempId => {
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          onRemoveFile(tempId);
        };

        const errorMessageMaybe = disputeError ? (
          <FormattedMessage id="DisputeModal.disputeSubmitFailed" />
        ) : null;

        return (
          <Form className={classes} onSubmit={handleSubmit}>
            <FieldSelect
              className={css.disputeField}
              id={formId ? `${formId}.disputeReason` : 'disputeReason'}
              name="disputeReason"
              label={intl.formatMessage({ id: 'DisputeModal.reasonLabel' })}
              validate={required(intl.formatMessage({ id: 'DisputeModal.reasonRequired' }))}
            >
              <option value="">
                {intl.formatMessage({ id: 'DisputeModal.reasonPlaceholder' })}
              </option>
              {DISPUTE_REASONS.map(r => (
                <option key={r.value} value={r.value}>
                  {intl.formatMessage({ id: r.labelId })}
                </option>
              ))}
            </FieldSelect>

            <FieldTextInput
              className={css.disputeMessage}
              type="textarea"
              id={formId ? `${formId}.disputeComment` : 'disputeComment'}
              name="disputeComment"
              label={intl.formatMessage({ id: 'DisputeModal.label' })}
              placeholder={intl.formatMessage({ id: 'DisputeModal.disputePlaceholder' })}
              validate={required(intl.formatMessage({ id: 'DisputeModal.disputeReasonRequired' }))}
            />

            <FieldTextInput
              className={css.disputeField}
              type="text"
              id={formId ? `${formId}.shippingCarrier` : 'shippingCarrier'}
              name="shippingCarrier"
              label={intl.formatMessage({ id: 'DisputeModal.shippingCarrierLabel' })}
              placeholder={intl.formatMessage({ id: 'DisputeModal.shippingCarrierPlaceholder' })}
              validate={required(
                intl.formatMessage({ id: 'DisputeModal.shippingCarrierRequired' })
              )}
            />

            <FieldTextInput
              className={css.disputeField}
              type="text"
              id={formId ? `${formId}.trackingNumber` : 'trackingNumber'}
              name="trackingNumber"
              label={intl.formatMessage({ id: 'DisputeModal.trackingNumberLabel' })}
              placeholder={intl.formatMessage({ id: 'DisputeModal.trackingNumberPlaceholder' })}
              validate={required(intl.formatMessage({ id: 'DisputeModal.trackingNumberRequired' }))}
            />

            <div className={css.mediaSection}>
              <p className={css.mediaLabel}>
                <FormattedMessage id="DisputeModal.mediaLabel" />
              </p>
              {files.length > 0 ? (
                <div className={css.files}>
                  {files.map(f => (
                    <FileUpload
                      item={f}
                      key={f.tempId}
                      onRemoveFile={onRemoveFileAndClearInput}
                      onDownloadFile={onDownloadFile}
                    />
                  ))}
                </div>
              ) : null}
              {canAddMoreFiles ? (
                <Field name="addFile" type="file">
                  {fieldProps => {
                    const { input } = fieldProps;
                    const onChange = e => {
                      const file = e.target.files[0];
                      if (file) {
                        onFileUpload(file);
                        e.target.value = '';
                      }
                    };
                    return (
                      <label className={css.addFileButton}>
                        <input
                          id="disputeModalAddFile"
                          name={input.name}
                          type="file"
                          onChange={onChange}
                          ref={fileInputRef}
                          className={css.hiddenFileInput}
                        />
                        <span className={css.addFileLabel}>
                          <IconAttachFile />
                          <FormattedMessage id="DisputeModal.addMedia" />
                          <span className={css.addFileCount}>
                            ({files.length}/{MAX_DISPUTE_FILES})
                          </span>
                        </span>
                      </label>
                    );
                  }}
                </Field>
              ) : null}
            </div>

            <p className={css.errorPlaceholder}>{errorMessageMaybe}</p>
            <Button
              className={css.submitButton}
              type="submit"
              inProgress={disputeInProgress}
              disabled={submitDisabled}
              ready={disputeSubmitted}
            >
              {intl.formatMessage({ id: 'DisputeModal.submit' })}
            </Button>
          </Form>
        );
      }}
    />
  );
};

// Show dispute form
const DisputeInfo = props => {
  const config = useConfiguration();
  const marketplaceName = config.marketplaceName;

  return (
    <>
      <p className={css.modalTitle}>
        <FormattedMessage id="DisputeModal.title" />
      </p>
      <p className={css.modalMessage}>
        <FormattedMessage id="DisputeModal.description" values={{ marketplaceName }} />
      </p>
      <DisputeForm
        onSubmit={props.onDisputeOrder}
        disputeSubmitted={props.disputeSubmitted}
        disputeInProgress={props.disputeInProgress}
        disputeError={props.disputeError}
        intl={props.intl}
        files={props.files}
        onFileUpload={props.onFileUpload}
        onRemoveFile={props.onRemoveFile}
        onDownloadFile={props.onDownloadFile}
      />
    </>
  );
};

// Show info that dispute form has been sent already.
const DisputeSentInfo = props => (
  <>
    <p className={css.modalTitle}>
      <FormattedMessage id="DisputeModal.sentTitle" />
    </p>
    <p className={css.modalMessage}>
      <FormattedMessage id="DisputeModal.sentMessage" />
    </p>
    <p className={css.modalMessage}>
      <FormattedMessage id="DisputeModal.sentNextStep" />
    </p>
  </>
);

/**
 * Dispute modal
 *
 * @component
 * @param {Object} props - The props
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {string} [props.rootClassName] - Custom class that extends the default class for the root element
 * @param {string} props.id - The id
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onCloseModal - The on close modal function
 * @param {Function} props.onManageDisableScrolling - The on manage disable scrolling function
 * @param {Function} props.onDisputeOrder - The on dispute order function
 * @param {boolean} props.disputeSubmitted - Whether the dispute is submitted
 * @param {boolean} props.disputeInProgress - Whether the dispute is in progress
 * @param {propTypes.error} props.disputeError - The dispute error
 * @param {Array} props.files - File uploads from Redux state
 * @param {Function} props.onFileUpload - Upload a file
 * @param {Function} props.onRemoveFile - Remove a file by tempId
 * @param {Function} props.onDownloadFile - Download a file
 * @returns {JSX.Element} The DisputeModal component
 */
const DisputeModal = props => {
  const intl = useIntl();
  const {
    className,
    rootClassName,
    id,
    isOpen = false,
    onCloseModal,
    onManageDisableScrolling,
    onDisputeOrder,
    focusElementId,
    disputeSubmitted = false,
    disputeInProgress = false,
    disputeError,
    files = [],
    onFileUpload,
    onRemoveFile,
    onDownloadFile,
  } = props;
  const classes = classNames(rootClassName || css.root, className);

  return (
    <Modal
      id={id}
      containerClassName={classes}
      contentClassName={css.modalContent}
      isOpen={isOpen}
      onClose={onCloseModal}
      onManageDisableScrolling={onManageDisableScrolling}
      focusElementId={focusElementId}
      usePortal
      closeButtonMessage={intl.formatMessage({ id: 'DisputeModal.close' })}
    >
      <IconDisputeOrder className={css.modalIcon} />
      {disputeSubmitted ? (
        <DisputeSentInfo />
      ) : (
        <DisputeInfo
          onDisputeOrder={onDisputeOrder}
          disputeSubmitted={disputeSubmitted}
          disputeInProgress={disputeInProgress}
          disputeError={disputeError}
          intl={intl}
          files={files}
          onFileUpload={onFileUpload}
          onRemoveFile={onRemoveFile}
          onDownloadFile={onDownloadFile}
        />
      )}
    </Modal>
  );
};

export default DisputeModal;
