import {PlusOutlined, ExclamationCircleOutlined, EditOutlined, DeleteOutlined} from '@ant-design/icons';
import {Button, Divider, message, Drawer, Modal} from 'antd';
import React, {useState, useRef} from 'react';
import {PageContainer, FooterToolbar} from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import type {ProColumns, ActionType} from '@ant-design/pro-table';
import ProDescriptions, {ProDescriptionsItemProps} from '@ant-design/pro-descriptions';
import CreateProductForm from './components/CreateProductForm';
import UpdateProductForm from './components/UpdateProductForm';
import type {ProductListItem} from './data.d';
import {queryProduct, updateProduct, addProduct, removeProduct} from './service';
import type {ProductParams} from "./data.d";

const {confirm} = Modal;

/**
 * 添加节点
 * @param fields
 */
const handleAdd = async (fields: ProductParams) => {
  const hide = message.loading('正在添加');
  try {
    await addProduct({...fields});
    hide();
    message.success('添加成功');
    return true;
  } catch (error) {
    hide();
    message.error('添加失败请重试！');
    return false;
  }
};

/**
 * 更新节点
 * @param fields
 */
const handleUpdate = async (fields: ProductListItem) => {
  const hide = message.loading('正在更新');
  try {
    await updateProduct(fields);
    hide();

    message.success('更新成功');
    return true;
  } catch (error) {
    hide();
    message.error('更新失败请重试！');
    return false;
  }
};

/**
 *  删除节点
 * @param selectedRows
 */
const handleRemove = async (selectedRows: ProductListItem[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    await removeProduct({
      ids: selectedRows.map((row) => row.id),
    });
    hide();
    message.success('删除成功，即将刷新');
    return true;
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
    return false;
  }
};

const TableList: React.FC<{}> = () => {
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<ProductListItem>();
  const [selectedRowsState, setSelectedRows] = useState<ProductListItem[]>([]);

  const showDeleteConfirm = (item: ProductListItem) => {
    confirm({
      title: '是否删除记录?',
      icon: <ExclamationCircleOutlined/>,
      content: '删除的记录不能恢复,请确认!',
      onOk() {
        handleRemove([item]).then((r) => {
          actionRef.current?.reloadAndRest?.();
        });
      },
      onCancel() {
      },
    });
  };

  const columns: ProColumns<ProductListItem>[] = [
    {
      title: '编号',
      dataIndex: 'id',
      hideInSearch: true,
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      render: (dom, entity) => {
        return <a onClick={() => {
          setCurrentRow(entity);
          setShowDetail(true);
        }}>{dom}</a>;
      },
    },
    {
      title: '商品图片',
      dataIndex: 'pic',
      valueType: 'image',
      fieldProps: {width: 100, height: 80},
      hideInSearch: true,
    },
    {
      title: '价格/货号',
      dataIndex: 'promotionPrice',
      hideInSearch: true,
    },
    {
      title: '排序',
      dataIndex: 'sort',
      hideInSearch: true,
    },
    {
      title: 'SKU库存',
      dataIndex: 'stock',
      hideInSearch: true,
    },
    {
      title: '销量',
      dataIndex: 'sale',
      hideInSearch: true,
    },
    {
      title: '审核状态',
      dataIndex: 'verifyStatus',
      valueEnum: {
        0: {text: '未审核', status: 'Error'},
        1: {text: '审核通过', status: 'Success'},
      },
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <>
          <Button
            type="primary"
            icon={<EditOutlined/>}
            onClick={() => {
              handleUpdateModalVisible(true);
              setCurrentRow(record);
            }}
          >
            编辑
          </Button>
          <Divider type="vertical"/>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined/>}
            onClick={() => {
              showDeleteConfirm(record);
            }}
          >
            删除
          </Button>
        </>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<ProductListItem>
        headerTitle="商品列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button type="primary" onClick={() => handleModalVisible(true)}>
            <PlusOutlined/> 新建商品
          </Button>,
        ]}
        request={queryProduct}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => setSelectedRows(selectedRows),
        }}
        pagination={{pageSize: 10}}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              已选择 <a style={{fontWeight: 600}}>{selectedRowsState.length}</a> 项&nbsp;&nbsp;
            </div>
          }
        >
          <Button
            onClick={async () => {
              await handleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            批量删除
          </Button>
        </FooterToolbar>
      )}

      <CreateProductForm
        key={'CreateProductForm'}
        onSubmit={async (value) => {
          const success = await handleAdd(value);
          if (success) {
            handleModalVisible(false);
            setCurrentRow(undefined);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={() => {
          handleModalVisible(false);
          if (!showDetail) {
            setCurrentRow(undefined);
          }
        }}
        createModalVisible={createModalVisible}
      />

      <UpdateProductForm
        key={'UpdateProductForm'}
        onSubmit={async (value) => {
          const success = await handleUpdate(value);
          if (success) {
            handleUpdateModalVisible(false);
            setCurrentRow(undefined);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={() => {
          handleUpdateModalVisible(false);
          if (!showDetail) {
            setCurrentRow(undefined);
          }
        }}
        updateModalVisible={updateModalVisible}
        currentData={currentRow || {}}
      />

      <Drawer
        width={600}
        visible={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false)
        }}
        closable={false}
      >
        {currentRow?.id && (
          <ProDescriptions<ProductListItem>
            column={2}
            title={currentRow?.id}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.id,
            }}
            columns={columns as ProDescriptionsItemProps<ProductListItem>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
