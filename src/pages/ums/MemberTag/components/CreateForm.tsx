import React, {useEffect} from 'react';
import {Form, Input, InputNumber, Modal, Radio} from 'antd';
import type {MemberTagListItem} from '../data.d';

export interface CreateFormProps {
  onCancel: () => void;
  onSubmit: (values: MemberTagListItem) => void;
  createModalVisible: boolean;
}

const FormItem = Form.Item;

const formLayout = {
  labelCol: {span: 9},
  wrapperCol: {span: 11},
};

const CreateForm: React.FC<CreateFormProps> = (props) => {
  const [form] = Form.useForm();

  const {
    onSubmit,
    onCancel,
    createModalVisible,
  } = props;

  useEffect(() => {
    if (form && !createModalVisible) {
      form.resetFields();
    }
  }, [props.createModalVisible]);


  const handleSubmit = () => {
    if (!form) return;
    form.submit();
  };

  const handleFinish = (values: MemberTagListItem) => {
    if (onSubmit) {
      onSubmit(values);
    }
  };

  const renderContent = () => {
    return (
      <>
        <FormItem
          name="tagName"
          label="标签名称"
          rules={[{required: true, message: '请输入标签名称!'}]}
        >
          <Input id="create-tagName" placeholder={'请输入标签名称!'} style={{width:253}}/>
        </FormItem>
        <FormItem
          name="finishOrderAmount"
          label="自动打标签完成订单金额"
          initialValue={1000}
          rules={[{required: true, message: '请输入自动打标签完成订单金额!'}]}
        >
          <InputNumber id="create-finishOrderAmount" placeholder={'请输入自动打标签完成订单金额!'}
                       style={{width: 255}}/>
        </FormItem>
        <FormItem
          name="finishOrderCount"
          label="自动打标签完成订单数量"
          initialValue={100}
          rules={[{required: true, message: '请输入自动打标签完成订单数量!'}]}
        >
          <InputNumber id="create-finishOrderCount" placeholder={'请输入自动打标签完成订单数量!'} style={{width: 255}}/>
        </FormItem>
        <FormItem
          name="status"
          label="状态"
          initialValue={1}
          rules={[{required: true, message: '请输入状态：0->禁用；1->启用!'}]}
        >
          <Radio.Group>
            <Radio value={0}>禁用</Radio>
            <Radio value={1}>启用</Radio>
          </Radio.Group>
        </FormItem>

      </>
    );
  };


  const modalFooter = {okText: '保存', onOk: handleSubmit, onCancel};

  return (
    <Modal
      forceRender
      destroyOnClose
      title="新增"
      open={createModalVisible}
      {...modalFooter}
      width={680}
    >
      <Form
        {...formLayout}
        form={form}
        onFinish={handleFinish}
      >
        {renderContent()}
      </Form>
    </Modal>
  );
};

export default CreateForm;
