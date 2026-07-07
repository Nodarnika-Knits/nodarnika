import React from 'react';
import classNames from 'classnames';
import { Form as FinalForm } from 'react-final-form';

import { useConfiguration } from '../../../context/configurationContext';
import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { propTypes } from '../../../util/types';
import { required } from '../../../util/validators';

import { FieldTextInput, Form, Modal, Button } from '../../../components';

import IconTruck from './IconTruck';
import css from './MarkDeliveredModal.module.css';

const MarkDeliveredForm = props => (
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
        markDeliveredSubmitted,
        markDeliveredError,
        markDeliveredInProgress,
      } = fieldRenderProps;

      const errorMessageMaybe = markDeliveredError ? (
        <FormattedMessage id="MarkDeliveredModal.submitFailed" />
      ) : null;

      const classes = classNames(rootClassName || css.formRoot, className);
      const submitInProgress = markDeliveredInProgress;
      const submitDisabled = invalid || disabled || submitInProgress;

      return (
        <Form className={classes} onSubmit={handleSubmit}>
          <FieldTextInput
            className={css.shippingCarrier}
            type="text"
            id={formId ? `${formId}.shippingCarrier` : 'shippingCarrier'}
            name="shippingCarrier"
            label={intl.formatMessage({ id: 'MarkDeliveredModal.shippingCarrierLabel' })}
            placeholder={intl.formatMessage({
              id: 'MarkDeliveredModal.shippingCarrierPlaceholder',
            })}
            validate={required(
              intl.formatMessage({ id: 'MarkDeliveredModal.shippingCarrierRequired' })
            )}
          />
          <FieldTextInput
            className={css.trackingNumber}
            type="text"
            id={formId ? `${formId}.trackingNumber` : 'trackingNumber'}
            name="trackingNumber"
            label={intl.formatMessage({ id: 'MarkDeliveredModal.trackingNumberLabel' })}
            placeholder={intl.formatMessage({
              id: 'MarkDeliveredModal.trackingNumberPlaceholder',
            })}
            validate={required(
              intl.formatMessage({ id: 'MarkDeliveredModal.trackingNumberRequired' })
            )}
          />
          <p className={css.errorPlaceholder}>{errorMessageMaybe}</p>
          <Button
            className={css.submitButton}
            type="submit"
            inProgress={markDeliveredInProgress}
            disabled={submitDisabled}
            ready={markDeliveredSubmitted}
          >
            {intl.formatMessage({ id: 'MarkDeliveredModal.submit' })}
          </Button>
        </Form>
      );
    }}
  />
);

// Show mark delivered form
const MarkDeliveredInfo = props => {
  const config = useConfiguration();
  const marketplaceName = config.marketplaceName;
  const { onMarkDelivered, ...restOfProps } = props;

  return (
    <>
      <p className={css.modalTitle}>
        <FormattedMessage id="MarkDeliveredModal.title" />
      </p>
      <p className={css.modalMessage}>
        <FormattedMessage id="MarkDeliveredModal.description" values={{ marketplaceName }} />
      </p>
      <MarkDeliveredForm onSubmit={onMarkDelivered} {...restOfProps} />
    </>
  );
};

/**
 * Mark delivered modal. Asks the provider for a shipping carrier and tracking number
 * before marking a shippable order as delivered.
 *
 * @component
 * @param {Object} props - The props
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {string} [props.rootClassName] - Custom class that extends the default class for the root element
 * @param {string} props.id - The id
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onCloseModal - The on close modal function
 * @param {Function} props.onManageDisableScrolling - The on manage disable scrolling function
 * @param {Function} props.onMarkDelivered - The on mark delivered function
 * @param {boolean} props.markDeliveredSubmitted - Whether the mark delivered form is submitted
 * @param {boolean} props.markDeliveredInProgress - Whether the mark delivered transition is in progress
 * @param {propTypes.error} props.markDeliveredError - The mark delivered error
 * @returns {JSX.Element} The MarkDeliveredModal component
 */
const MarkDeliveredModal = props => {
  const intl = useIntl();
  const {
    className,
    rootClassName,
    id,
    isOpen = false,
    onCloseModal,
    focusElementId,
    onManageDisableScrolling,
    onMarkDelivered,
    markDeliveredSubmitted = false,
    markDeliveredInProgress = false,
    markDeliveredError,
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
      closeButtonMessage={intl.formatMessage({ id: 'MarkDeliveredModal.close' })}
    >
      <IconTruck className={css.modalIcon} />
      <MarkDeliveredInfo
        onMarkDelivered={onMarkDelivered}
        markDeliveredInProgress={markDeliveredInProgress}
        markDeliveredError={markDeliveredError}
        markDeliveredSubmitted={markDeliveredSubmitted}
        intl={intl}
      />
    </Modal>
  );
};

export default MarkDeliveredModal;
