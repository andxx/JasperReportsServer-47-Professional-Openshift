Jasper Reports Server on Openshift
==================================
Instructions to install


Application creation
--------------------
Create a new <b>JBoss Application Server 7.1</b> application:

    rhc app create -a jrs47 -t jbossas-7


Cartridges configuration
------------------------
Add a <b>Mysql</b> cartridge

    rhc app cartridge add -a jrs47 -c mysql-5.1


Clone repository
----------------
Clone JRS 47 Pro github repository

    cd jrs47
    git remote add upstream -m master git://github.com/Jaspersoft/JasperReportsServer-47-Professional-Openshift.git
    git pull -s recursive -X theirs upstream master

Commit the changes

    git commit -a -m "Added JRS 47 pro"

Push the changes

    git push


Access application
------------------
    http://jrs47-$yournamespace.rhcloud.com/jasperserver-pro
