JasperReports Server 4.7.0 Professional on OpenShift
====================================================

Prerequisites
-------------
OpenShift account
Command line client tools
https://openshift.redhat.com/app/getting_started


Application and Application Server
----------------------------------
Create a new <b>JBoss Application Server 7.1</b> application.
For example, "jrs47" is a reasonable name for JasperReports Server 4.7.

    rhc app create -a jrs47 -t jbossas-7


Cartridges configuration
------------------------
Add a <b>MySQL</b> cartridge

    rhc app cartridge add -a jrs47 -c mysql-5.1


Clone repository
----------------
Clone JRS 47 Pro github repository

    cd jrs47
    git remote add upstream -m master git://github.com/Jaspersoft/JasperReportsServer-47-Professional-Openshift.git
    git pull -s recursive -X theirs upstream master

Optional: Make some changes
Optional: Commit the changes

    git commit -a -m "Added JRS 4.7.0 Pro"

Push the changes up to OpenShift

    git push


Access application
------------------
    http://jrs47-$yournamespace.rhcloud.com/jasperserver-pro
