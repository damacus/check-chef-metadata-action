name              'aws'
maintainer        'Sous Chefs'
maintainer_email  'help@sous-chefs.org'
license           'Apache-2.0'
description       'Provides resources for managing AWS resources'
source_url        'https://github.com/sous-chefs/aws'
issues_url        'https://github.com/sous-chefs/aws/issues'
chef_version      '>= 15.3'
version           '9.0.13'

supports 'ubuntu'
supports 'debian'
supports 'centos'
supports 'redhat'
supports 'amazon'
supports 'scientific'
supports 'fedora'
supports 'oracle'
supports 'freebsd'
supports 'windows'
supports 'suse'
supports 'opensuse'
supports 'opensuseleap'

# Test looping doesn't crash the process
%w( aws-sdk aws-sdk-core ).each do |g|
  gem g, '>= 3.0'
end

# Pin the aws sdk to the minor version to only pull
# in new patches by default. For some of these
# gems AWS typically releases a new minor version
# daily so this should reduce the number of gem
# versions that someone has installed.
# gem 'aws-sdk-cloudformation', '~> 1.21.0'
# gem 'aws-sdk-cloudwatch', '~> 1.22.0'
# gem 'aws-sdk-core', '~> 3.109.0'
# gem 'aws-sdk-dynamodb', '~> 1.28.0'
# gem 'aws-sdk-ec2', '~> 1.214.0'
# gem 'aws-sdk-elasticloadbalancing', '~> 1.14.0'
# gem 'aws-eventstream', '~> 1.0.3'
# gem 'aws-sdk-iam', '~> 1.22.0'
# gem 'aws-sdk-kinesis', '~> 1.15.0'
# gem 'aws-sdk-kms', '~> 1.39.0'
# gem 'aws-sdk-route53', '~> 1.24.0'
# gem 'aws-partitions', '~> 1.239.0'
# gem 'aws-sdk-s3', '~> 1.86.0'
# gem 'aws-sigv4', '~> 1.1.0'
# gem 'aws-sdk-ssm', '~> 1.46.0'
