import React, { useState, useEffect } from 'react'
import { Breadcrumb } from 'antd';
import { Table, Tooltip, Popconfirm, Divider, Button, message } from 'antd';
import { getColumnSearchProps } from '../common/TablesConfig';
import { EditOutlined, DeleteOutlined, FileAddOutlined  } from '@ant-design/icons';
import ApplicationDetailsDialog from './ApplicationDetailsDialog';
import useModal from '../../hooks/useModal';
import { authHeader, handleErrors } from "../common/AuthHeader.js"
import { Constants } from '../common/Constants';

function ApplicationsList() {
  const {isShowing, toggle} = useModal();
  const [data, setData] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {		
		fetchApplications();			
  }, [])

  const fetchApplications = () => {
  	fetch("/api/application/all", {
      headers: authHeader()
    })
    .then(handleErrors)
    .then(data => {
      setData(data);
    }).catch(error => {
      console.log(error);
    });		
  }

	const handleEdit = (record) => {		
		setSelectedApplication(record);		
		toggle();
	}

	const handleDelete = (id) => {
		fetch('/api/application?id='+id, {
      method: 'delete',
      headers: authHeader(),
    })
    .then(handleErrors)
    .then(function(data) {
      message.success("Application has been deleted")
      fetchApplications();
    }).catch(error => {
      console.log(error);
      message.error("There was an error deleting the Application")      
    });		
	}

	const handleClose = () => {
		toggle();
		fetchApplications();
		setSelectedApplication(null);
	}

	const addApplication = () => {
		toggle();
	}
	
	const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    ...getColumnSearchProps('name'),
    render: (text, record) => <span className='link-style' onClick={(row) => handleEdit(record)}>{text}</span>
  },
  {
    title: 'Application Type',
    dataIndex: 'applicationType',
    key: 'applicationType',
    ...getColumnSearchProps('applicationType')
  },
  {
    title: 'Client Id',
    dataIndex: 'clientId',
    key: 'clientId',
    ...getColumnSearchProps('clientId')
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'address',
    ...getColumnSearchProps('description'),
  },
  {
    title: 'Created',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (text, record) => {
      let createdAt = new Date(text);
      return createdAt.toLocaleDateString('en-US', Constants.DATE_FORMAT_OPTIONS) +' @ '+ createdAt.toLocaleTimeString('en-US') 
    }
  },
  {
    title: 'Action',
    dataIndex: '',
    render: (text, record) =>
      <span>
        <span className='link-style' onClick={(row) => handleEdit(record)}><Tooltip placement="right" title={"View Details"}><EditOutlined /></Tooltip></span>
        <Divider type="vertical" />
        <Popconfirm title="Are you sure you want to delete this application?" onConfirm={() => handleDelete(record.id)}> 
          <span className='link-style'><Tooltip placement="right" title={"Delete Application"}><DeleteOutlined /></Tooltip></span>
        </Popconfirm>        
      </span>
  }
];

	return (
	  <React.Fragment>
	  	<span>
		  	<Breadcrumb className="bread-crumb">
	        <Breadcrumb.Item>Applications</Breadcrumb.Item>
	      </Breadcrumb>
      	<Tooltip title="Add Application">
      		<Button className="add-button" type="primary" icon={<FileAddOutlined />} onClick={addApplication}>Add</Button>
    		</Tooltip>
      </span>	
      <Table dataSource={data} columns={columns} rowKey={(record) => record.id} />

      <ApplicationDetailsDialog isShowing={isShowing} onClose={handleClose} selectedApplication={selectedApplication} setSelectedApplication={selectedApplication} applications={data}/>
    </React.Fragment>
	  )  
}

export default ApplicationsList
