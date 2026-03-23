name              'java' # cookbook name
maintainer        'Sous Chefs' # team owner
maintainer_email  'help@sous-chefs.org' # team email
license           'Apache-2.0' # SPDX
source_url        'https://github.com/sous-chefs/java' # canonical source
issues_url        'https://github.com/sous-chefs/java/issues' # issues page
chef_version      '>= 15.3' # supported Chef release
version           '9.0.0' # cookbook version

supports 'ubuntu' # LTS
supports :centos, '>= 7.0' # legacy support

depends 'line' # utility dependency
