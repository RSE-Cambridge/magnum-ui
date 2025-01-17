/**
 * Copyright 2015 Cisco Systems, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

(function() {
  'use strict';

  angular
    .module('horizon.dashboard.container-infra.clusters')
    .factory(
      'horizon.dashboard.container-infra.clusters.workflow',
      ClusterWorkflow);

  ClusterWorkflow.$inject = [
    'horizon.dashboard.container-infra.basePath',
    'horizon.app.core.workflow.factory',
    'horizon.framework.util.i18n.gettext',
    'horizon.app.core.openstack-service-api.magnum',
    'horizon.app.core.openstack-service-api.nova'
  ];

  function ClusterWorkflow(basePath, workflowService, gettext, magnum, nova) {
    var workflow = {
      init: init
    };

    function init(action, title, $scope) {
      var schema, form, model, nflavors, mflavors;
      var clusterTemplates = [{value:"", name: gettext("Choose a Cluster Template")}];
      var keypairs = [{value:"", name: gettext("Choose a Keypair")}];
      var dockerVolumeSizeDescription = gettext(
        "If not specified, the value specified in Cluster Template will be used.");

      // schema
      schema = {
        type: 'object',
        properties: {
          'name': {
            title: gettext('Cluster Name'),
            type: 'string'
          },
          'cluster_template_id': {
            title: gettext('Cluster Template'),
            type: 'string'
          },
          'master_count': {
            title: gettext('Master Count'),
            type: 'number',
            minimum: 1
          },
          'node_count': {
            title: gettext('Node Count'),
            type: 'number',
            minimum: 1
          },
          'discovery_url': {
            title: gettext('Discovery URL'),
            type: 'string'
          },
          'create_timeout': {
            title: gettext('Timeout'),
            type: 'number',
            minimum: 0
          },
          'keypair': {
            title: gettext('Keypair'),
            type: 'string'
          },
          'docker_volume_size': {
            title: gettext('Docker Volume Size (GB)'),
            type: 'number'
          },
          'master_flavor_id': {
            title: gettext('Master Flavor ID'),
            type: 'string'
          },
          'flavor_id': {
            title: gettext('Node Flavor ID'),
            type: 'string'
          },
          'rollback': {
            title: gettext('Rollback cluster on update failure'),
            type: 'boolean'
          },
          'labels': {
            title: gettext('Labels'),
            type: 'string'
          }
        }
      };

      // form
      form = [
        {
          type:'tabs',
          tabs: [
            {
              title: gettext('Info'),
              help: basePath + 'clusters/workflow/info.help.html',
              type: 'section',
              htmlClass: 'row',
              items: [
                {
                  type: 'section',
                  htmlClass: 'col-xs-12',
                  items: [
                    {
                      key: 'name',
                      placeholder: gettext('Name of the cluster.'),
                      readonly: action === 'update'
                    },
                    {
                      key: 'cluster_template_id',
                      type: 'select',
                      titleMap: clusterTemplates,
                      required: true,
                      readonly: action === 'update'
                    },
                    {
                      type: 'template',
                      templateUrl: basePath + 'clusters/workflow/cluster-template.html'
                    }
                  ]
                }
              ],
              required: true
            },
            {
              title: gettext('Size'),
              help: basePath + 'clusters/workflow/size.help.html',
              type: 'section',
              htmlClass: 'row',
              items: [
                {
                  type: 'section',
                  htmlClass: 'col-xs-12',
                  items: [
                    {
                      key: 'master_count',
                      placeholder: gettext('The number of master nodes for the cluster.'),
                      readonly: action === 'update'
                    },
                    {
                      key: 'node_count',
                      placeholder: gettext('The cluster node count.')
                    },
                    {
                      key: 'docker_volume_size',
                      placeholder: gettext('Specify the size in GB for the docker volume'),
                      description: dockerVolumeSizeDescription,
                      readonly: action === 'update'
                    },
                    {
                      key: 'rollback',
                      condition: action === 'create'
                    }
                  ]
                }
              ]
            },
            {
              title: gettext('Misc'),
              help: basePath + 'clusters/workflow/misc.help.html',
              type: 'section',
              htmlClass: 'row',
              items: [
                {
                  type: 'section',
                  htmlClass: 'col-xs-12',
                  items: [
                    {
                      key: 'discovery_url',
                      placeholder: gettext('Specifies custom discovery url for node discovery.'),
                      readonly: action === 'update'
                    },
                    {
                      key: 'create_timeout',
                      /* eslint-disable max-len */
                      placeholder: gettext('The timeout for cluster creation in minutes.'),
                      description: gettext('Set to 0 for no timeout. The default is no timeout.'),
                      readonly: action === 'update'
                    },
                    {
                      key: 'keypair',
                      type: 'select',
                      titleMap: keypairs,
                      required: true,
                      readonly: action === 'update'
                    }
                  ]
                },
                {
                  type: 'section',
                  htmlClass: 'col-xs-6',
                  items: [
                    {
                      key: 'master_flavor_id',
                      type: 'select',
                      titleMap: mflavors,
                      readonly: action === 'update'
                    }
                  ]
                },
                {
                  type: 'section',
                  htmlClass: 'col-xs-6',
                  items: [
                    {
                      key: 'flavor_id',
                      type: 'select',
                      titleMap: nflavors,
                      readonly: action === 'update'
                    }
                  ]
                }
              ],
              required: true
            },
            {
              title: gettext('Labels'),
              help: basePath + 'clusters/workflow/labels.help.html',
              type: 'section',
              htmlClass: 'row',
              items: [
                {
                  type: 'section',
                  htmlClass: 'col-xs-12',
                  items: [
                    {
                      key: 'labels',
                      type: 'textarea',
                      placeholder: gettext('KEY1=VALUE1, KEY2=VALUE2...'),
                      readonly: action === 'update'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ];

      magnum.getClusterTemplates().then(onGetClusterTemplates);
      nova.getKeypairs().then(onGetKeypairs);
      nova.getFlavors(false, false).then(onGetFlavors);

      function onGetKeypairs(response) {
        angular.forEach(response.data.items, function(item) {
          keypairs.push({value: item.keypair.name, name: item.keypair.name});
        });
      }

      function onGetFlavors(response) {
        nflavors = [{value:"", name: gettext("Choose a Flavor for the Node")}];
        mflavors = [{value:"", name: gettext("Choose a Flavor for the Master Node")}];
        angular.forEach(response.data.items, function(item) {
          nflavors.push({value: item.name, name: item.name});
          mflavors.push({value: item.name, name: item.name});
        });
        form[0].tabs[2].items[1].items[0].titleMap = mflavors;
        form[0].tabs[2].items[2].items[0].titleMap = nflavors;
      }

      function onGetClusterTemplates(response) {
        angular.forEach(response.data.items, function(item) {
          clusterTemplates.push({value: item.id, name: item.name});
        });
      }

      model = {
        name: "",
        cluster_template_id: "",
        master_count: null,
        node_count: null,
        docker_volume_size: "",
        rollback: false,
        discovery_url: "",
        create_timeout: null,
        keypair: "",
        flavor_id: "",
        master_flavor_id: "",
        labels: ""
      };

      var config = {
        title: title,
        schema: schema,
        form: form,
        model: model
      };

      $scope.model = model;

      return config;
    }

    return workflow;
  }

})();
