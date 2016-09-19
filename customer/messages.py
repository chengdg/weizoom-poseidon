# -*- coding: utf-8 -*-
import json
import time
import base64

from django.http import HttpResponseRedirect, HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response
from django.contrib.auth.decorators import login_required

from core import resource
from core.jsonresponse import create_response
import nav
import models
from resource import models as resource_models
from util import string_util

FIRST_NAV = 'customer'
SECOND_NAV = 'customer-accounts'


class Messages(resource.Resource):
	app = 'customer'
	resource = 'messages'

	@login_required
	def get(request):
		"""
		用户提交信息页面
		"""
		c = RequestContext(request, {
			'first_nav_name': FIRST_NAV,
			'second_navs': nav.get_second_navs(),
			'second_nav_name': SECOND_NAV
		})
		
		return render_to_response('customer/messages.html', c)

	@login_required
	def api_put(request):
		"""
		保存提交信息
		"""
		messages = request.POST.get('name', '')
		customer_message = models.CustomerMessage.objects.create(
			user = request.user, 
			name = request.POST['name'], 
			mobile_number = request.POST['mobileNumber'], 
			email = request.POST['email'],
			interface_url = request.POST['interfaceUrl'],
			server_ip = request.POST['serverIp'],
			status = models.STATUS_CHECKING
		)

		server_ips = json.loads(request.POST['serverIps'])
		for server_ip in server_ips:
			models.CustomerServerIps.objects.create(customer=customer_message, name=server_ip['ipName'])

		response = create_response(200)
		return response.get_response()