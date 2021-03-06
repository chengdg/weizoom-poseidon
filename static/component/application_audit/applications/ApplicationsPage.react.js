/**
 * Copyright(c) 2012-2016 weizoom
 */
"use strict";

var debug = require('debug')('m:application_audit.applications:ApplicationsPage');
var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('underscore');

var Reactman = require('reactman');

var Store = require('./Store');
var Constant = require('./Constant');
var Action = require('./Action');
var ApplicationDialog = require('./ApplicationDialog.react');

require('./style.css');

var ApplicationsPage = React.createClass({
	getInitialState: function() {
		Store.addListener(this.onChangeStore);
		return Store.getData();
	},

	onClickChangeStatus: function(event) {
		var customerId = parseInt(event.target.getAttribute('data-customer-id'));
		var method = event.target.getAttribute('data-method');
		var title = '该应用激活审核确认通过?';
		if( method === 'close'){
			title = '确认停用该应用吗?'
		}
		Reactman.PageAction.showConfirm({
			target: event.target,
			title: title,
			confirm: _.bind(function() {
				Action.ChangeStatus(customerId, method, this.refs.table.refresh);
			}, this)
		});
	},

	onClickUnPass: function(event) {
		var customerId = event.target.getAttribute('data-customer-id');
		Reactman.PageAction.showDialog({
			title: "应用审核驳回",
			component: ApplicationDialog,
			data: {
				id: customerId
			},
			success: function() {
				Action.updateApplication();
			}
		});
	},

	onChangeStore: function(event) {
		var filterOptions = Store.getData().filterOptions;
		this.refs.table.refresh(filterOptions);
	},

	rowFormatter: function(field, value, data) {
		if (field === 'action') {
			if(data.status === '待审核'){
				return (
					<div>
						<a className="btn btn-link btn-xs" onClick={this.onClickChangeStatus} data-customer-id={data.id} data-method='open'>确认通过</a>
						<a className="btn btn-link btn-xs" onClick={this.onClickUnPass} data-customer-id={data.id}>驳回修改</a>
					</div>
				);
			}else if(data.status === '已启用'){
				return (
					<div>
						<a className="btn btn-link btn-xs" onClick={this.onClickChangeStatus} data-customer-id={data.id} data-method='close'>暂停停用</a>
					</div>
				);
			}else if(data.status === '已停用'){
				return (
					<div>
						<a className="btn btn-link btn-xs" onClick={this.onClickChangeStatus} data-customer-id={data.id} data-method='open'>开启应用</a>
					</div>
				);
			}else{
				return (
					<div>
						<p>{data.reason}</p>
					</div>
				);
			}
		} else if (field === 'serverIp'){
			var serverIps = data['serverIp'];
			console.log(serverIps);
			var serverIpLi = '';

			if(serverIps.length>0){
				serverIpLi = serverIps.map(function(serverIp, index){
					return(
						<p>{serverIp}</p>
					)
				})
			}
			return (
				<div>
					{serverIpLi}
				</div>
			);
		}else{
			return value;
		}
	},

	onConfirmFilter: function(data) {
		Action.filterApplication(data);
	},

	render:function(){
		var applicationsResource = {
			resource: 'application_audit.applications',
			data: {
				page: 1
			}
		};
		var statusOptions = [{
			text: '全部',
			value: -1
		}, {
			text: '未激活',
			value: 0
		}, {
			text: '待审核',
			value: 1
		}, {
			text: '已启用',
			value: 2
		}, {
			text: '已驳回',
			value: 3
		}, {
			text: '已停用',
			value: 4
		}];

		return (
		<div className="mt15 xui-config-usersPage">
			<Reactman.FilterPanel onConfirm={this.onConfirmFilter}>
				<Reactman.FilterRow>
					<Reactman.FilterField>
						<Reactman.FormInput label="登录名:" name="username" match='=' />
					</Reactman.FilterField>
					<Reactman.FilterField>
						<Reactman.FormInput label="主体名称:" name="displayName" match='=' />
					</Reactman.FilterField>
					<Reactman.FilterField>
						<Reactman.FormSelect label="应用状态:" name="status" options={statusOptions} match='=' />
					</Reactman.FilterField>
				</Reactman.FilterRow>
			</Reactman.FilterPanel>

			<Reactman.TablePanel>
				<Reactman.TableActionBar>
				</Reactman.TableActionBar>
				<Reactman.Table resource={applicationsResource} formatter={this.rowFormatter} pagination={true} ref="table">
					<Reactman.TableColumn name="登录名" field="username" />
					<Reactman.TableColumn name="主体名称" field="displayName" />
					<Reactman.TableColumn name="应用名称" field="appName" />
					<Reactman.TableColumn name="app_id" field="appId"/>
					<Reactman.TableColumn name="app_secret" field="appSecret"/>
					<Reactman.TableColumn name="开发者姓名" field="DeveloperName"/>
					<Reactman.TableColumn name="手机号" field="phone"/>
					<Reactman.TableColumn name="邮箱" field="email"/>
					<Reactman.TableColumn name="服务器IP" field="serverIp"/>
					<Reactman.TableColumn name="回调地址" field="interfaceUrl"/>
					<Reactman.TableColumn name="状态" field="status"/>
					<Reactman.TableColumn name="操作" field="action" width="120px" />
				</Reactman.Table>
			</Reactman.TablePanel>
		</div>
		)
	}
})
module.exports = ApplicationsPage;