from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('index', views.index, name='index'),
    path('search', views.search, name='search'),
    path('browse', views.browse, name='browse'),
    path('charts', views.charts, name='charts'),
    path('faq', views.faq, name='faq'),
    path('contact', views.contact, name='contact')
]
