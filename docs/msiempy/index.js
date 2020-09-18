URLS=[
"index.html",
"event.html",
"core/query.html",
"core/types.html",
"core/index.html",
"core/config.html",
"core/session.html",
"core/utils.html",
"device.html",
"alarm.html",
"watchlist.html"
];
INDEX=[
{
"ref":"msiempy",
"url":0,
"doc":"Welcome to the  msiempy library documentation. The pythonic way to deal with McAfee SIEM API. Head out to one of the sub-modules to see objects definitions or scroll down for general documentation.  Links : [GitHub](https: github.com/mfesiem/msiempy), [PyPI](https: pypi.org/project/msiempy/), [Class diagram](https: mfesiem.github.io/docs/msiempy/classes.png), [Packages diagram](https: mfesiem.github.io/docs/msiempy/packages.png), [SIEM API documentation](https: mfesiem.github.io) (generated PDFs)   Installation   python3 -m pip install msiempy    Authentication and configuration setup The module offers a single point of authentication against your SIEM, so you don't have to worry about authentication when writting your scripts. This means that you need to preconfigure the authentication using the configuration file. The configuration file is located (by default) securely in your user directory since it contains credentials. - For Windows:  %APPDATA%\\.msiem\\conf.ini - For Mac :  $HOME/.msiem/conf.ini - For Linux :  $XDG_CONFIG_HOME/.msiem/conf.ini or :  $HOME/.msiem/conf.ini   [esm] host = HOST user = USER passwd = PASSWORD's BASE64 [general] verbose = no quiet = no logfile = /var/log/msiempy/log.txt timeout = 60 ssl_verify = no   To set the password, you can use the [ msiempy_setup.py ](https: github.com/mfesiem/msiempy/blob/master/samples/msiempy_setup.py) script. You can also directly paste the password's base64 in the config file by doing:   >>> import base64 >>> passwd = 'P@assW0rd' >>> print(base64.b64encode(passwd.encode('utf-8' .decode( UEBhc3NXMHJk    Examples  Acknowledge alarms See objects:  msiempy.alarm.AlarmManager and  msiempy.alarm.Alarm Print all  unacknowledged alarms of the year who's name  match  'Test alarm' and triggering event message match  'Wordpress' . Then acknowledge the alarms and make sure they are all acknowledged. The number of alarms retreived is defined by the  page_size property.   from msiempy import AlarmManager, Alarm  Make an alarm query alarms=AlarmManager( time_range='CURRENT_YEAR', status_filter='unacknowledged',  This filter is computed on the server side filters=[('alarmName', 'Test alarm')],  Other filters are applied as regex event_filters=[('ruleName','Wordpress')], page_size=5  Will only load 5 alarms (per query), increase limit to 500 or 1000 for better performance )  Load the data into the list alarms.load_data()  Print results print(\"Alarm list: \") print(alarms) print(alarms.get_text( fields=['id','triggeredDate','acknowledgedDate', 'alarmName', 'acknowledgedUsername']  Acknowledge alarms print(\"Acknowledge alarms .\") for alarm in alarms: alarm.acknowledge()   Query events See objects:  msiempy.event.EventManager ,  msiempy.event.FieldFilter ,  msiempy.event.Event Query events according to destination IP and hostname filters, sorted by AlertID.   from msiempy import EventManager, FieldFilter print('Simple event query sorted by AlertID') events = EventManager( time_range='CURRENT_YEAR', fields=['SrcIP', 'AlertID'],  SrcIP and AlertID are not queried by default filters=[ FieldFilter('DstIP', ['0.0.0.0/0',]), FieldFilter('HostID', ['mail'], operator='CONTAINS')],  Please replace \"mail\" by a test hostname order= 'ASCENDING', 'AlertID' , limit=10)  Will only load 10 events (per query), increase limit to 500 or 1000 once finish testing for better performance events.load_data() print(events) print(events.get_text(fields=['AlertID','LastTime','SrcIP', 'Rule.msg']    Add a note to events Setting the note of an event, retreiving the genuine event from IPSIDAlertID and checking the note is well set. See [ add_wpsan_note.py ](https: github.com/mfesiem/msiempy/blob/master/samples/add_wpsan_note.py) script to see more how to add note to event that triggered alarms !   from msiempy import EventManager, Event events = EventManager( time_range='CURRENT_YEAR', limit=2 ) events.load_data() for event in events : event.set_note(\"Test note\") genuine_event = Event(id=event['IPSIDAlertID'])  Event data will be loaded with ipsGetAlertData assert \"Test note\" in genuine_event['note'], \"The note doesn't seem to have been added to the event {}\".format(event)    msiempy.event.EventManager() have other arguments:  order ,  start_time and  end_time or  time_rage  msiempy.event.EventManager.load_data() method accept also several parameters. It controls the query's division time range into slots of  delta duration, then the query would be divided into the specified number of  slots . Control also the number of asyncronous jobs using  workers parameter.  max_query_depth parameter specify the number of sub-divisions the query can take at most (zero by default). The query is divided only if it hasn't completed with the current query settings. See method documentation for more infos. See [ dump_all_fields.py ](https: github.com/mfesiem/msiempy/blob/master/samples/dump_all_fields.py) script to have full list of  fields you can request and fields you can use with  FieldFilter .  Print ESM infos See object:  msiempy.device.ESM Print a few esm infos. ESM object has not state for it self, it's a simple interface to data structures / values returned by the SIEM.   >>> from msiempy import ESM >>> esm=ESM() >>> esm.version() '11.2.1' >>> esm.recs() [('ERC-1', 144116287587483648)] >>> esm.buildstamp() '11.2.1 20190725050014'    Dump Datasources See objects:  msiempy.device.DevTree ,  msiempy.device.DataSource Load all datasources and write all infos in a CSV file.   from msiempy import DevTree devtree = DevTree() with open('all-datasources.csv', 'w') as f: f.write(devtree.get_text(format='csv'    Dump Watchlists definitions See objects:  msiempy.watchlist.WatchlistManager ,  msiempy.watchlist.Watchlist Print whatchlist list.   from msiempy import WatchlistManager watchlists=WatchlistManager() print(watchlists)    Use the Session object See object:  msiempy.core.session.NitroSession You can choose not to use wrapper ojects like  AlarmManager and use directly the Session object to make any API calls with any data. The Session object will handle intermittent SIEM errors.   from msiempy import NitroSession s = NitroSession() s.login()  Get all last 24h alarms details with ESM API v2 (not supported by other objects yet) alarms = s.api_request('v2/alarmGetTriggeredAlarms?triggeredTimeRange=LAST_24_HOURS&status=&pageSize=500&pageNumber=1') for a in alarms: a.update(s.api_request('v2/notifyGetTriggeredNotificationDetail', {'id':a['id']}    And more . See the [samples folder](https: github.com/mfesiem/msiempy/tree/master/samples) for more detailed uses ! You can also review the [tests](https: github.com/mfesiem/msiempy/tree/master/tests).  Changelog Please refer to the [releases](https: github.com/mfesiem/msiempy/releases) github page.  Contribute Pull requests are welcome! Please read the [contributing](https: github.com/mfesiem/msiempy/blob/master/CONTRIBUTING.md) file.  Run tests Run all tests, sometimes the tests have to be reruns.   pytest  reruns 3   You might also want to run per-file tests   pytest tests/auth/test_device.py   Or per-method test   python3 -m unittest tests.auth.test_event.T.test_add_note    Code analysis [![Codacy Badge](https: app.codacy.com/project/badge/Grade/114821fcf6e14b8eb0f927e0112488c8)](https: www.codacy.com/gh/mfesiem/msiempy?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=mfesiem/msiempy&amp;utm_campaign=Badge_Grade) [![Maintainability](https: api.codeclimate.com/v1/badges/0cc21ba8f82394cb05f3/maintainability)](https: codeclimate.com/github/mfesiem/msiempy/maintainability)  Error report Configure log file reporting in the configuration file and and look for  \"ERROR\" . Useful shell command to get simple list of errors:   cat /path/to/your/log/file | grep -i error | sort | uniq  "
},
{
"ref":"msiempy.event",
"url":1,
"doc":"Provide event management."
},
{
"ref":"msiempy.event.EventManager",
"url":1,
"doc":"List-Like object. Interface to query and manage events. Inherits from  msiempy.core.query.FilteredQueryList . Arguments: -  fields : list of strings representing all fields you want to apprear in the Events records. Get the list of possible fields by calling  msiempy.event.EventManager.get_possible_fields() method or see  msiempy.event.Event . Some default fields will be present. -  order :  tuple  direction, field  . Direction can be 'ASCENDING' or 'DESCENDING'. -  limit : max number of rows per query. -  filters : list of filters. A filter can be a  tuple(field, [values]) or it can be a  msiempy.event.FieldFilter or  msiempy.event.GroupFilter if you wish to use advanced filtering. -  time_range : Query time range. String representation of a time range. Not need to specify 'CUSTOM' if  start_time and  end_time are set. -  start_time : Query start time, can be a  string or a  datetime object. Parsed with  dateutil . -  end_time : Query end time, can be a  string or a  datetime object. Parsed with  dateutil ."
},
{
"ref":"msiempy.event.EventManager.POSSBILE_ROW_ORDER",
"url":1,
"doc":" ASCENDING or  DESCENDING "
},
{
"ref":"msiempy.event.EventManager.order",
"url":1,
"doc":"The  order is a  tuple (direction, field) . Default value is  (DESCENDING, LastTime) ."
},
{
"ref":"msiempy.event.EventManager.filters",
"url":1,
"doc":"Returns SIEM formatted filters for the query structured from  msiempy.event.GroupFilter and/or  msiempy.event.FieldFilter See  msiempy.core.query.FilteredQueryList.filters ."
},
{
"ref":"msiempy.event.EventManager.add_filter",
"url":1,
"doc":"Add a filter to the query. Argument must be a  tuple(field, [values]) or  (field, value) or  msiempy.event.GroupFilter or  msiempy.event.FieldFilter .",
"func":1
},
{
"ref":"msiempy.event.EventManager.clear_filters",
"url":1,
"doc":"Replace all filters by a non filtering rule. Acts like there is not filters.",
"func":1
},
{
"ref":"msiempy.event.EventManager.qry_load_data",
"url":1,
"doc":"Helper method to execute the query and load the data : -> Submit the query -> Wait the query to be executed -> Get and parse the events Arguments: -  retry ( int ): number of time the query can be failed and retried. Retries only when 'ResultUnavailable','UnknownList' or 'JobEngine_GetQueryResults_QueryNotFound_Unrecoverable' errors. -  wait_timeout_sec ( int ): wait timeout in seconds Returns :  tuple :   msiempy.event.EventManager , Query completed?  True/False  Raises  msiempy.core.session.NitroError if any unhandled errors. Raises  TimeoutError if wait_timeout_sec counter gets to 0.",
"func":1
},
{
"ref":"msiempy.event.EventManager.load_data",
"url":1,
"doc":"Load the data into the list. Split the query in defferents time slots if the query apprears not to be completed. Wraps around  msiempy.event.EventManager.qry_load_data . Note: Only the first query is loaded asynchronously. Arguments: -  workers : numbre of parrallels tasks, should be equal or less than the number of slots. -  slots : number of time slots the query can be divided. The loading bar is divided according to the number of slots -  delta : exemple : '6h30m', the query will be firstly divided in chuncks according to the time delta read with dateutil. -  max_query_depth : maximum number of reccursive divisions the query before to . Meaning, if EventManager query  limit=500 ,  slots=5  and  max_query_depth=3 , then the maximum capacity of the list is  (500 5) (500 5) (500 5) =  15625000000 . Only works for certain time ranges. -  retry ( int ): number of time the query can be failed and retried -  wait_timeout_sec ( int ): wait timeout in seconds Returns :  msiempy.event.EventManager ",
"func":1
},
{
"ref":"msiempy.event.EventManager.get_possible_fields",
"url":1,
"doc":"Return the list of possible fields that you can request in a query. The list is loaded from the SIEM.",
"func":1
},
{
"ref":"msiempy.event.EventManager.get_possible_filters",
"url":1,
"doc":"Return the list of possible fields that you can use as a filter in a query. The list is loaded from the SIEM.",
"func":1
},
{
"ref":"msiempy.event.EventManager.time_range",
"url":2,
"doc":"Query time range. See  msiempy.core.query.FilteredQueryList.POSSIBLE_TIME_RANGE . Default to  msiempy.core.query.FilteredQueryList.DEFAULT_TIME_RANGE (CURRENT_DAY). Note that the time range is upper cased automatically. Raises  VallueError if unrecognized time range is set and  AttributeError if not the right type."
},
{
"ref":"msiempy.event.EventManager.start_time",
"url":2,
"doc":"Start time of the query in the right SIEM format. Use  _start_time to get the datetime object. You can set the  star_time as a  str or a  datetime . If  None , equivalent CURRENT_DAY start 00:00:00. Raises:  ValueError if not the right type."
},
{
"ref":"msiempy.event.EventManager.end_time",
"url":2,
"doc":"End time of the query in the right SIEM format. Use  _end_time property to get the datetime object. You can set the  end_time as a  str or a  datetime . If  None , equivalent CURRENT_DAY. Raises  ValueError if not the right type."
},
{
"ref":"msiempy.event.EventManager.keys",
"url":3,
"doc":"Set of keys for all dict",
"func":1
},
{
"ref":"msiempy.event.EventManager.get_text",
"url":3,
"doc":"Return a csv or table string representation of the list Arguments: -  format : prettytable: Returns a table generated by prettytable csv: Returns data with header and comma separated values. -  fields : list of fields you want in the table. If  None : default fields are returned by .keys attribute and sorted. -  max_column_width : when using prettytable only -  get_text_nest_attr : attributes passed to the nested  msiempy.core.types.NitroList.get_text elements if any. Useful to control events appearence.",
"func":1
},
{
"ref":"msiempy.event.EventManager.text",
"url":3,
"doc":"Defaut table string, a shorcut to  get_text() with no arguments."
},
{
"ref":"msiempy.event.EventManager.json",
"url":3,
"doc":"JSON list of dicts representing the list."
},
{
"ref":"msiempy.event.EventManager.search",
"url":3,
"doc":"Return a list of elements that matches one or more regex patterns. Patterns are applied one after another Use  | inside patterns to search with logic OR. This method will return a new NitroList with matching data. NitroDicts in the returned NitroList do not references the items in the original NitroList. Arguments: -  pattern : List or string regex patterns to look for. Each -  invert : Weither or not to invert the search and return elements that doesn't not match search. -  match_prop : Propertie that is going to be called to search. Could be  text or  json . If you wish to apply more specific filters to NitroList list, please use filter(), list comprehension, or other filtering method. i.e. :  [item for item in list if item['cost'] > 50] More on regex https: docs.python.org/3/library/re.html re.Pattern.search",
"func":1
},
{
"ref":"msiempy.event.EventManager.refresh",
"url":3,
"doc":"Execute refresh function on all items.",
"func":1
},
{
"ref":"msiempy.event.EventManager.perform",
"url":3,
"doc":"Wrapper arround executable and the a list of elements, typically  msiempy.core.types.NitroList object. Arguments: -  func : callable function.  func is going to be called like  func(item,  func_args) on all items in data. This function can be stateless (static) or statefull (first argument is  self ), it doesn't really matter as the element will always be passed as the first argument of the function. On thing really important, the function must not set/delete/change any global variable, as a result, you'll see your varible beeing potentially corrupted or chalenged with conccurent accesses. -  data : if stays  None , will perform the action on itself ( list(self) ) else it will perfom the action on the  data list. -  func_args : arguments that will be passed by default to  func in all calls. -  confirm : will ask interactively confirmation. -  asynch : execute the task asynchronously with  concurrent.futures.ThreadPoolExecutor . It will create a new executor object, so be carefull not to nest 2 asynchronous executions within eachother, it will be a mess. -  workers : number of parrallel tasks, mandatory if asynch is true. -  progress : to show progress bar with ETA (tqdm). -  message : To show to the user. This method is where the core of asynchronous tasks resides.  func will be executed on all  data elements. Basically, if  asynch True , will return : returned=list(concurrent.futures.ThreadPoolExecutor( max_workers=workers ).map( func, data if  asynch False , will iterate and return : for index_or_item in data: returned.append(func(index_or_item Returns a list of returned results.",
"func":1
},
{
"ref":"msiempy.event.EventManager.NitroJSONEncoder",
"url":3,
"doc":"Custom JSON encoder that will use the approprtiate propertie depending of the type of NitroObject. TODO support json json dumping of QueryFilers, may be by making them inherits from NitroDict."
},
{
"ref":"msiempy.event.EventManager.nitro",
"url":3,
"doc":" msiempy.core.session.NitroSession object. Interface to the SIEM."
},
{
"ref":"msiempy.event.Event",
"url":1,
"doc":"Dict-Like object. Event interface. This object handles events objects created with  msiempy.event.EventManager (From the  qryGetResults api call) and events objects created with  msiempy.alarm.AlarmManager (From  ipsGetAlertData api call or  notifyGetTriggeredNotificationDetail depending of the value of  load_data(events_details=True/False) ) . Common keys for alert data events (When loading from ID or with  AlarmManager.load_data() : -  ruleName -  srcIp -  destIp -  protocol -  lastTime -  subtype -  destPort -  destMac -  srcMac -  srcPort -  deviceName -  sigId -  normId -  srcUser -  destUser -  normMessage -  normDesc -  host -  domain -  ipsId Common keys for triggered alarms events (When using  AlarmManager.load_data(events_details=False) ) (SIEM v11.x only): -  ruleMessage -  eventId -  severity -  eventCount -  sourceIp -  destIp -  protocol -  lastTime -  eventSubType Common keys for query events (When using  EventManager ): -  Rule.msg -  Alert.LastTime -  Alert.IPSIDAlertID - and any other . You can request more fields by passing a list of fields to the  msiempy.event.EventManager object.  msiempy.event.Event.REGULAR_EVENT_FIELDS offer a base list of regular fields that may be useful. See msiempy/static JSON files to browse complete list : https: github.com/mfesiem/msiempy/blob/master/static/all_fields.json You can also use this script to dinamically print the available fields and filters : https: github.com/mfesiem/msiempy/blob/master/samples/dump_all_fields.py Arguments: -  adict : Event parameters -  id : The event  IPSIDAlertID to instanciate. Will load informations  For query events : We tried our best effort to match SIEM returned fields with initially requested fields. Prefixes  Alert. ,  Rule. , etc are optionnal, autocompletion is computed in any case.  __getitem__ ,  __contains__ ,  __setitem__ and  __delitem__ method have been rewrote in order to offer more straight-forward  dict usage. For exemple, if the SIEM returns results with keys like  Alert.65613 ,  Alert.BIN(7) or  Alert.SrcIP : you'll be able to use  Event dict with your initial queried keys like  Event['Web_Doamin']  ,  Event['UserIDSrc'] or  Event['SrcIP'] . (You can still use internal keys if you want). Exemple:"
},
{
"ref":"msiempy.event.Event.FIELDS_TABLES",
"url":1,
"doc":"List of internal fields table :  Rule , Alert ,etc."
},
{
"ref":"msiempy.event.Event.DEFAULTS_EVENT_FIELDS",
"url":1,
"doc":"Always present when using  msiempy.event.EventManager querying :  Rule.msg  Alert.LastTime  Alert.IPSIDAlertID "
},
{
"ref":"msiempy.event.Event.REGULAR_EVENT_FIELDS",
"url":1,
"doc":"List of regular event fields.  Rule.msg  Alert.SrcIP  Alert.DstIP  Alert.SrcMac  Alert.DstMac  Rule.NormID  HostID  UserIDSrc  ObjectID  Alert.Severity  Alert.LastTime  Alert.DSIDSigID  Alert.IPSIDAlertID "
},
{
"ref":"msiempy.event.Event.SIEM_FIELDS_MAP_INTERNAL_NAME_TO_NICKNAME",
"url":1,
"doc":"Fields name mapping."
},
{
"ref":"msiempy.event.Event.SIEM_FIELDS_MAP_NICKNAME_TO_INTERNAL_NAME",
"url":1,
"doc":"Fields name mapping (reversed)."
},
{
"ref":"msiempy.event.Event.get_id",
"url":1,
"doc":"Get the event ID. Try to return  e['Alert.IPSIDAlertID'] or e['eventId'] or concatenate  e['ipsId']['id'] and  e['alertId'] depending of the Event dictionnary keys.",
"func":1
},
{
"ref":"msiempy.event.Event.clear_notes",
"url":1,
"doc":"Replace the notes by an empty string. Desctructive action.",
"func":1
},
{
"ref":"msiempy.event.Event.set_note",
"url":1,
"doc":"Set the event's note. Desctructive action.",
"func":1
},
{
"ref":"msiempy.event.Event.data_from_id",
"url":1,
"doc":"Load event's data. Arguments: -  id : The event ID. (i.e. :  144128388087414784|747122896 ) -  use_query : Uses the query module to retreive common event data. Only works with SIEM 11.2 or greater. Default behaviour will call  ipsGetAlertData to retreive the complete event definition. -  extra_fields : Only when  use_query=True . Additionnal event fields to load in the query.",
"func":1
},
{
"ref":"msiempy.event.Event.refresh",
"url":1,
"doc":"Re-load event's data",
"func":1
},
{
"ref":"msiempy.event.Event.json",
"url":3,
"doc":"JSON representation of a item"
},
{
"ref":"msiempy.event.Event.text",
"url":3,
"doc":"Text list of item's values"
},
{
"ref":"msiempy.event.Event.NitroJSONEncoder",
"url":3,
"doc":"Custom JSON encoder that will use the approprtiate propertie depending of the type of NitroObject. TODO support json json dumping of QueryFilers, may be by making them inherits from NitroDict."
},
{
"ref":"msiempy.event.Event.nitro",
"url":3,
"doc":" msiempy.core.session.NitroSession object. Interface to the SIEM."
},
{
"ref":"msiempy.event.GroupFilter",
"url":1,
"doc":"Based on EsmFilterGroup. See SIEM api doc. Used to dump groups of filters in the right format. Arguments : -  filters : a list of filters. Filters can be  msiempy.event.FieldFilter or  msiempy.event.GroupFilter -  logic : 'AND' or 'OR'"
},
{
"ref":"msiempy.event.FieldFilter",
"url":1,
"doc":"Based on EsmFieldFilter SIEM api doc. This class is automatically used when instanciating  EventManager objects to dump filters in the right  dict format if tuples are gave as the  filters argument like:   e = EventManager(time_range='LAST_MINUTE', filters=[ ('SrcIP', ['10.5.0.0/16']) ])   Default operator is  \"IN\" . To change the operator, create a  FieldFilter : Exemple to filter by Signature ID.   e = EventManager(time_range='LAST_24_HOURS', filters=[ FieldFilter('DSIDSigID', [\"49190-4294967295\"], operator='EQUALS') ])    Make sure the filter name is valid by checking the result of  msiempy.event.EventManager.get_possible_filters or use the provided script in the sample folder Arguments: -  name : field name as string. Field name property. Example :  SrcIP . See full list here: https: github.com/mfesiem/msiempy/blob/master/static/all_filters.json -  values : list of values the field is going to be tested againts with the specified orperator. -  orperator :  IN ,  NOT_IN ,  GREATER_THAN ,  LESS_THAN ,  GREATER_OR_EQUALS_THAN ,  LESS_OR_EQUALS_THAN ,  NUMERIC_EQUALS ,  NUMERIC_NOT_EQUALS ,  DOES_NOT_EQUAL ,  EQUALS ,  CONTAINS ,  DOES_NOT_CONTAIN ,  REGEX ."
},
{
"ref":"msiempy.event.FieldFilter.DOCUMENTED_FILTERS",
"url":1,
"doc":"List fo documented filter names, show a warning if trying to filter on a unknown filter name"
},
{
"ref":"msiempy.event.FieldFilter.POSSIBLE_OPERATORS",
"url":1,
"doc":"List of possibles operators"
},
{
"ref":"msiempy.event.FieldFilter.POSSIBLE_VALUE_TYPES",
"url":1,
"doc":"List of possible value type. See  msiempy.event.FieldFilter.add_value ."
},
{
"ref":"msiempy.event.FieldFilter.operator",
"url":1,
"doc":"Filter operator. Throws  AttributeError if trying to set an unknown operator."
},
{
"ref":"msiempy.event.FieldFilter.values",
"url":1,
"doc":"List of values of the filter. Setter iterate trough the list and call : -  msiempy.event.FieldFilter.add_value() if value is a  dict -  msiempy.event.FieldFilter.add_basic_value() if value type is  int ,  float or  str . Values will always be added to the filter. To remove values, handle directly the  _values property. Example :  filter = FieldFilter(name='DstIP',values=[{'type':'EsmWatchlistValue', 'watchlist':42}], operator='IN') "
},
{
"ref":"msiempy.event.FieldFilter.add_value",
"url":1,
"doc":"Add a new value to the filter. Arguments ( kwargs depends on the value  type ): -  type ( str ) : Type of the value Dynamic arguments: -  value ( str ) : If  type is  EsmBasicValue -  watchlist ( int ) : if  type is  EsmWatchlistValue -  variable ( int ) if  type is  EsmVariableValue -  values ( list ) if  type is  EsmCompoundValue Raises :  KeyError or  AttributeError if you don't respect the correct type/key/value combo. Note : Filtering query with other type of filter than  EsmBasicValue is not tested.",
"func":1
},
{
"ref":"msiempy.event.FieldFilter.add_basic_value",
"url":1,
"doc":"Wrapper arround  add_value method to simply add a  EsmBasicValue .",
"func":1
},
{
"ref":"msiempy.event.FieldFilter.name",
"url":1,
"doc":"Name of the field"
},
{
"ref":"msiempy.core",
"url":4,
"doc":"The core objects of the library. Public objects: -  msiempy.core.session.NitroSession -  msiempy.core.config.NitroConfig -  msiempy.core.session.NitroError Base objects: -  msiempy.core.types.NitroObject -  msiempy.core.types.NitroDict -  msiempy.core.types.NitroList -  msiempy.core.query.FilteredQueryList "
},
{
"ref":"msiempy.core.config",
"url":5,
"doc":"Configuration parser object."
},
{
"ref":"msiempy.core.config.NitroConfig",
"url":5,
"doc":"Handles the configuration. Reads the config file  .msiem/conf.ini where ever it is and make accessible it's values throught object properties. If a  .msiem/ directory exists in your current directory, the program will assume the  conf.ini file is there, if not, it will create it with default values. Secondly, if no  .msiem/ directory exists in the current directory, it will be automatically placed in a appropriate place depending of your platform: Default configuration file should look like this. Authentication is left empty.   [esm] host = user = passwd = [general] verbose = False quiet = False logfile = timeout = 60 ssl_verify = False   For Windows:  %APPDATA%\\.msiem\\conf.ini For Mac :  $HOME/.msiem/conf.ini For Linux :  $XDG_CONFIG_HOME/.msiem/conf.ini or :  $HOME/.msiem/conf.ini If  .msiem folder exists in you local directory :  ./.msiem/conf.ini You can setup the configuration by command line with  msiempy_setup.py script at https: github.com/mfesiem/msiempy/blob/master/samples/msiempy_setup.py . Arguments: -  path : Config file special path, if path is left None, will automatically look for it. -  config : Manual config dict. ex:  {'general':{'verbose':True  . -  args,  kwargs : Passed to  configparser.ConfigParser.__init__() method."
},
{
"ref":"msiempy.core.config.NitroConfig.CONFIG_FILE_NAME",
"url":5,
"doc":" .msiem/conf.ini "
},
{
"ref":"msiempy.core.config.NitroConfig.CONF_DIR",
"url":5,
"doc":" .msiem/ "
},
{
"ref":"msiempy.core.config.NitroConfig.DEFAULT_CONF_DICT",
"url":5,
"doc":"Default configuration values."
},
{
"ref":"msiempy.core.config.NitroConfig.write",
"url":5,
"doc":"Write the config file to the predetermined path.",
"func":1
},
{
"ref":"msiempy.core.config.NitroConfig.iset",
"url":5,
"doc":"Interactively set the specified section/option by asking the user the input. Arguments: -  section : Configuration's section. Exemple : 'esm' or 'general'. -  option : Configuraion's option. Leave to  None to set the whole section one after another. Exemple : 'user', 'timeout'. -  secure : Will use getpass to retreive the configuration value and won't print old value.",
"func":1
},
{
"ref":"msiempy.core.config.NitroConfig.user",
"url":5,
"doc":""
},
{
"ref":"msiempy.core.config.NitroConfig.host",
"url":5,
"doc":""
},
{
"ref":"msiempy.core.config.NitroConfig.passwd",
"url":5,
"doc":""
},
{
"ref":"msiempy.core.config.NitroConfig.verbose",
"url":5,
"doc":""
},
{
"ref":"msiempy.core.config.NitroConfig.quiet",
"url":5,
"doc":""
},
{
"ref":"msiempy.core.config.NitroConfig.logfile",
"url":5,
"doc":""
},
{
"ref":"msiempy.core.config.NitroConfig.timeout",
"url":5,
"doc":""
},
{
"ref":"msiempy.core.config.NitroConfig.ssl_verify",
"url":5,
"doc":""
},
{
"ref":"msiempy.core.config.NitroConfig.find_ini_location",
"url":5,
"doc":"Returns the location of a supposed conf.ini file the  conf.ini file. If  .msiem folder exists in you local directory, assume the  conf.ini file is in there. If the file doesn't exist, will still return the location. Do not create a file nor directory, you must call  msiempy.core.config.NitroConfig.write .",
"func":1
},
{
"ref":"msiempy.core.query",
"url":2,
"doc":"Base query class with timerange handling."
},
{
"ref":"msiempy.core.query.FilteredQueryList",
"url":2,
"doc":"Base class for query based managers :  msiempy.alarm.AlarmManager ,  msiempy.event.EventManager . FilteredQueryList object can handle time_ranges and time splitting. Abstract base class that provide time ranged filtered query wrapper. Arguments: -  time_range : Query time range. String representation of a time range. See  msiempy.core.query.FilteredQueryList.POSSIBLE_TIME_RANGE . -  start_time : Query starting time, can be a  string or a  datetime object. Parsed with  dateutil . -  end_time : Query endding time, can be a  string or a  datetime object. Parsed with  dateutil . -  filters : List of filters applied to the query."
},
{
"ref":"msiempy.core.query.FilteredQueryList.DEFAULT_TIME_RANGE",
"url":2,
"doc":"Default time range : CURRENT_DAY"
},
{
"ref":"msiempy.core.query.FilteredQueryList.POSSIBLE_TIME_RANGE",
"url":2,
"doc":"List of possible time ranges :  CUSTOM, LAST_MINUTE, LAST_10_MINUTES, LAST_30_MINUTES, LAST_HOUR, CURRENT_DAY, PREVIOUS_DAY, LAST_24_HOURS, LAST_2_DAYS, LAST_3_DAYS, CURRENT_WEEK, PREVIOUS_WEEK, CURRENT_MONTH, PREVIOUS_MONTH, CURRENT_QUARTER, PREVIOUS_QUARTER, CURRENT_YEAR, PREVIOUS_YEAR "
},
{
"ref":"msiempy.core.query.FilteredQueryList.time_range",
"url":2,
"doc":"Query time range. See  msiempy.core.query.FilteredQueryList.POSSIBLE_TIME_RANGE . Default to  msiempy.core.query.FilteredQueryList.DEFAULT_TIME_RANGE (CURRENT_DAY). Note that the time range is upper cased automatically. Raises  VallueError if unrecognized time range is set and  AttributeError if not the right type."
},
{
"ref":"msiempy.core.query.FilteredQueryList.start_time",
"url":2,
"doc":"Start time of the query in the right SIEM format. Use  _start_time to get the datetime object. You can set the  star_time as a  str or a  datetime . If  None , equivalent CURRENT_DAY start 00:00:00. Raises:  ValueError if not the right type."
},
{
"ref":"msiempy.core.query.FilteredQueryList.end_time",
"url":2,
"doc":"End time of the query in the right SIEM format. Use  _end_time property to get the datetime object. You can set the  end_time as a  str or a  datetime . If  None , equivalent CURRENT_DAY. Raises  ValueError if not the right type."
},
{
"ref":"msiempy.core.query.FilteredQueryList.filters",
"url":2,
"doc":"Filter property : Returns a list of filters. Can be set with list of tuple(field, [values]), a  msiempy.event.FieldFilter or  msiempy.event.GroupFilter in the case of a  msiempy.event.EventManager query. A single tuple is also accepted.  None value will trigger  msiempy.core.query.FilteredQueryList.clear_filters() . Raises :  AttributeError if type not supported. Abstract declaration. TODO find a better solution to integrate the filter property"
},
{
"ref":"msiempy.core.query.FilteredQueryList.add_filter",
"url":2,
"doc":"Add a filter to the query. Abstract declaration.",
"func":1
},
{
"ref":"msiempy.core.query.FilteredQueryList.clear_filters",
"url":2,
"doc":"Remove all filters to the query. Abstract declaration.",
"func":1
},
{
"ref":"msiempy.core.query.FilteredQueryList.qry_load_data",
"url":2,
"doc":"Method to load the data from the SIEM. Rturns a  tuple  items, completed  . Abstract declaration.",
"func":1
},
{
"ref":"msiempy.core.query.FilteredQueryList.load_data",
"url":2,
"doc":"Load the data from the SIEM into the list. Abstract declaration.",
"func":1
},
{
"ref":"msiempy.core.query.FilteredQueryList.keys",
"url":3,
"doc":"Set of keys for all dict",
"func":1
},
{
"ref":"msiempy.core.query.FilteredQueryList.get_text",
"url":3,
"doc":"Return a csv or table string representation of the list Arguments: -  format : prettytable: Returns a table generated by prettytable csv: Returns data with header and comma separated values. -  fields : list of fields you want in the table. If  None : default fields are returned by .keys attribute and sorted. -  max_column_width : when using prettytable only -  get_text_nest_attr : attributes passed to the nested  msiempy.core.types.NitroList.get_text elements if any. Useful to control events appearence.",
"func":1
},
{
"ref":"msiempy.core.query.FilteredQueryList.text",
"url":3,
"doc":"Defaut table string, a shorcut to  get_text() with no arguments."
},
{
"ref":"msiempy.core.query.FilteredQueryList.json",
"url":3,
"doc":"JSON list of dicts representing the list."
},
{
"ref":"msiempy.core.query.FilteredQueryList.search",
"url":3,
"doc":"Return a list of elements that matches one or more regex patterns. Patterns are applied one after another Use  | inside patterns to search with logic OR. This method will return a new NitroList with matching data. NitroDicts in the returned NitroList do not references the items in the original NitroList. Arguments: -  pattern : List or string regex patterns to look for. Each -  invert : Weither or not to invert the search and return elements that doesn't not match search. -  match_prop : Propertie that is going to be called to search. Could be  text or  json . If you wish to apply more specific filters to NitroList list, please use filter(), list comprehension, or other filtering method. i.e. :  [item for item in list if item['cost'] > 50] More on regex https: docs.python.org/3/library/re.html re.Pattern.search",
"func":1
},
{
"ref":"msiempy.core.query.FilteredQueryList.refresh",
"url":3,
"doc":"Execute refresh function on all items.",
"func":1
},
{
"ref":"msiempy.core.query.FilteredQueryList.perform",
"url":3,
"doc":"Wrapper arround executable and the a list of elements, typically  msiempy.core.types.NitroList object. Arguments: -  func : callable function.  func is going to be called like  func(item,  func_args) on all items in data. This function can be stateless (static) or statefull (first argument is  self ), it doesn't really matter as the element will always be passed as the first argument of the function. On thing really important, the function must not set/delete/change any global variable, as a result, you'll see your varible beeing potentially corrupted or chalenged with conccurent accesses. -  data : if stays  None , will perform the action on itself ( list(self) ) else it will perfom the action on the  data list. -  func_args : arguments that will be passed by default to  func in all calls. -  confirm : will ask interactively confirmation. -  asynch : execute the task asynchronously with  concurrent.futures.ThreadPoolExecutor . It will create a new executor object, so be carefull not to nest 2 asynchronous executions within eachother, it will be a mess. -  workers : number of parrallel tasks, mandatory if asynch is true. -  progress : to show progress bar with ETA (tqdm). -  message : To show to the user. This method is where the core of asynchronous tasks resides.  func will be executed on all  data elements. Basically, if  asynch True , will return : returned=list(concurrent.futures.ThreadPoolExecutor( max_workers=workers ).map( func, data if  asynch False , will iterate and return : for index_or_item in data: returned.append(func(index_or_item Returns a list of returned results.",
"func":1
},
{
"ref":"msiempy.core.query.FilteredQueryList.NitroJSONEncoder",
"url":3,
"doc":"Custom JSON encoder that will use the approprtiate propertie depending of the type of NitroObject. TODO support json json dumping of QueryFilers, may be by making them inherits from NitroDict."
},
{
"ref":"msiempy.core.query.FilteredQueryList.nitro",
"url":3,
"doc":" msiempy.core.session.NitroSession object. Interface to the SIEM."
},
{
"ref":"msiempy.core.session",
"url":6,
"doc":"HTTP level interface to the ESM API."
},
{
"ref":"msiempy.core.session.NitroSession",
"url":6,
"doc":" msiempy.core.session.NitroSession is the point of convergence of every requests that goes to the ESM. It provides easier dialogue with the ESM by doing argument interpolation with  msiempy.core.session.NitroSession.PARAMS . Arguments: -  config :  msiempy.core.config.NitroConfig object, find default config if missing. See  msiempy.core.session.NitroSession.api_request and  msiempy.core.session.NitroSession.request for usage."
},
{
"ref":"msiempy.core.session.NitroSession.BASE_URL",
"url":6,
"doc":"API base url:  'https: {}/rs/esm/' "
},
{
"ref":"msiempy.core.session.NitroSession.BASE_URL_PRIV",
"url":6,
"doc":"Private API base URL:  'https: {}/ess/' "
},
{
"ref":"msiempy.core.session.NitroSession.PARAMS",
"url":6,
"doc":"SIEM API methos/parameters mapping. This structure provide a central place to aggregate API methods and parameters. See  msiempy.core.session.NitroSession.request for a list of all possible calls."
},
{
"ref":"msiempy.core.session.NitroSession.login",
"url":6,
"doc":"Authentication is done lazily upon the first call to  msiempy.core.session.NitroSession.request method, but you can still do it manually by calling this method. Throws  msiempy.core.session.NitroError if login fails.",
"func":1
},
{
"ref":"msiempy.core.session.NitroSession.logout",
"url":6,
"doc":"This method will logout the session.",
"func":1
},
{
"ref":"msiempy.core.session.NitroSession.api_request",
"url":6,
"doc":"Handle a lower level HTTP request to ESM API endpoints. Format the request, handle the basic parsing of the SIEM result as well as other errors. All upper cases method names signals to use the private API methods. Arguments: -  method : ESM API enpoint name and url formatted parameters -  http : HTTP method. -  data : dict data to send -  callback : function to apply afterwards -  raw : If true will return the Response object from requests module. No retry when raw=True. -  secure : If true will not log the content of the request. -  retry : Number of time the request can be retried Returns: - a  dict ,  list or  str object. - the  resquest.Response object if raw=True -  None if Timeout or TooManyRedirects if raw=False Raises: -  msiempy.core.session.NitroError if any  HTTPError Note : Private API is under /ess/ and public api is under /rs/esm Exemple: from msiempy import NitroSession s = NitroSession() s.login()  qryGetFilterFields s.api_request('qryGetFilterFields')  Get all last 24h alarms details with ESM API v2. alarms = s.api_request('v2/alarmGetTriggeredAlarms?triggeredTimeRange=LAST_24_HOURS&status=&pageSize=500&pageNumber=1', None) for a in alarms: a.update(s.api_request('v2/notifyGetTriggeredNotificationDetail', {'id':a['id']} ",
"func":1
},
{
"ref":"msiempy.core.session.NitroSession.version",
"url":6,
"doc":"Returns:  str ESM short version. Example: '10.0.2'",
"func":1
},
{
"ref":"msiempy.core.session.NitroSession.buildstamp",
"url":6,
"doc":"Returns:  str ESM buildstamp. Example: '10.0.2 20170516001031'",
"func":1
},
{
"ref":"msiempy.core.session.NitroSession.get_internal_file",
"url":6,
"doc":"Uses the private API to retrieve, assemble and delete a temp file from the ESM. Arguments: -  file_token ( str ): File token ID",
"func":1
},
{
"ref":"msiempy.core.session.NitroSession.request",
"url":6,
"doc":"Interface to make ESM API calls more simple by interpolating  kwargs arguments with  msiempy.core.session.NitroSession.PARAMS docstrings and build a valid datastructure for the HTTP data. Then call the  msiempy.core.session.NitroSession.api_request method with the built data. Also handles auto-login. Arguments: -  request : Name keyword corresponding to the request name in  msiempy.core.session.NitroSession.PARAMS mapping. -  http : HTTP method. -  callback : function to apply afterwards -  raw : If true will return the Response object from requests module. -  secure : If true will not log the content of the request. -  retry : Number of time the request can be retried Interpolation parameters : -  kwargs : Interpolation parameters that will be match to  msiempy.core.session.NitroSession.PARAMS templates. Dynamic keyword arguments. Returns: - a  dict ,  list or  str object - the  resquest.Response object if raw=True -  result.text if  requests.HTTPError , -  None if Timeout or TooManyRedirects if raw=False Exemple: from msiempy import NitroSession s = NitroSession() s.login()  Get all last 24h alarms details alarms = s.request('get_alarms', time_range='LAST_24_HOURS', status= , page_size=500, page_number=0) for a in alarms: a.update(s.request('get_notification_detail', id=a['id'] If you're reading this thom an IDE, all possible requests are listed on the documentation webpage: https: mfesiem.github.io/docs/msiempy/core/session.html msiempy.core.session.NitroSession.request All requests: (  All upper cases method names signals to use the private API methods. ) request('login', username, password)  Call login request('get_devtree', )  Call GRP_GETVIRTUALGROUPIPSLISTDATA request('get_zones_devtree', )  Call GRP_GETVIRTUALGROUPIPSLISTDATA request('req_client_str', ds_id)  Call DS_GETDSCLIENTLIST request('get_rfile', ftoken)  Call MISC_READFILE request('del_rfile', ftoken)  Call ESSMGT_DELETEFILE request('get_rfile2', ftoken, pos, nbytes)  Call MISC_READFILE request('get_wfile', ds_id)  Call MISC_WRITEFILE request('get_rule_history', )  Call PLCY_GETRULECHANGEINFO request('add_ds_11_1_3', parent_id, name, ds_ip, type_id, zone_id, enabled, url, ds_id, child_enabled, child_count, child_type, idm_id, parameters)  Call dsAddDataSource request('add_ds_11_2_1', parent_id, name, ds_ip, type_id, zone_id, enabled, url, parameters)  Call dsAddDataSources request('add_client1', parent_id, name, enabled, ds_ip, hostname, type_id, tz_id, dorder, maskflag, port, require_tls)  Call DS_ADDDSCLIENT request('get_recs', )  Call devGetDeviceList request('get_dstypes', rec_id)  Call dsGetDataSourceTypes request('del_ds1', parent_id, ds_id)  Call dsDeleteDataSource request('del_ds2', parent_id, ds_id)  Call dsDeleteDataSources request('del_client', parent_id, ftoken)  Call DS_DELETEDSCLIENTS request('get_job_status', job_id)  Call MISC_JOBSTATUS request('ds_last_times', )  Call QRY_GETDEVICELASTALERTTIME request('zonetree', )  Call zoneGetZoneTree request('ds_by_type', )  Call QRY_GETDEVICECOUNTBYTYPE request('ds_details1', ds_id)  Call dsGetDataSourceDetail request('ds_details2', ds_id)  Call dsGetDataSourceDetail request('get_alarms_custom_time', time_range, start_time, end_time, status, page_size, page_number)  Call alarmGetTriggeredAlarms request('get_alarms', time_range, status, page_size, page_number)  Call alarmGetTriggeredAlarms request('get_notification_detail', id)  Call notifyGetTriggeredNotificationDetail request('get_alarm_details', id)  Call notifyGetTriggeredNotification request('get_alarm_details_int', id)  Call NOTIFY_GETTRIGGEREDNOTIFICATIONDETAIL request('ack_alarms', ids)  Call alarmAcknowledgeTriggeredAlarm request('ack_alarms_11_2_1', ids)  Call alarmAcknowledgeTriggeredAlarm request('unack_alarms', ids)  Call alarmUnacknowledgeTriggeredAlarm request('unack_alarms_11_2_1', ids)  Call alarmUnacknowledgeTriggeredAlarm request('delete_alarms', ids)  Call alarmDeleteTriggeredAlarm request('delete_alarms_11_2_1', ids)  Call alarmDeleteTriggeredAlarm request('get_possible_filters', )  Call qryGetFilterFields request('get_possible_fields', type, groupType)  Call qryGetSelectFields request('get_esm_time', )  Call essmgtGetESSTime request('get_alerts_now', ds_id)  Call IPS_GETALERTSNOW request('get_flows_now', ds_id)  Call IPS_GETFLOWSNOW request('logout', )  Call logout request('get_user_locale', )  Call getUserLocale request('event_query_custom_time', time_range, start_time, end_time, fields, filters, limit, offset, order_field, order_direction)  Call qryExecuteDetail request('event_query', time_range, fields, filters, limit, offset, order_field, order_direction)  Call qryExecuteDetail request('query_status', resultID)  Call qryGetStatus request('query_result', startPos, numRows, resultID)  Call qryGetResults request('time_zones', )  Call userGetTimeZones request('add_note_to_event', id, note)  Call ipsAddAlertNote request('add_note_to_event_int', id, note)  Call IPS_ADDALERTNOTE request('get_wl_types', )  Call sysGetWatchlistFields request('get_watchlists_no_filters', hidden, dynamic, writeOnly, indexedOnly)  Call sysGetWatchlists request('get_watchlist_details', id)  Call sysGetWatchlistDetails request('add_watchlist', name, wl_type)  Call sysAddWatchlist request('add_watchlist_values', watchlist, values)  Call sysAddWatchlistValues request('get_watchlist_values', id)  Call SYS_GETWATCHLISTDETAILS request('remove_watchlists', wl_id_list)  Call sysRemoveWatchlist request('get_alert_data', id)  Call ipsGetAlertData request('get_sys_info', )  Call SYS_GETSYSINFO request('build_stamp', )  Call essmgtGetBuildStamp ",
"func":1
},
{
"ref":"msiempy.core.session.NitroError",
"url":6,
"doc":"Base ESM exception. It's used when the user/passwd is incorrect and other HTTP errors."
},
{
"ref":"msiempy.core.types",
"url":3,
"doc":"Base classes for SIEM interface objects and generic definitions."
},
{
"ref":"msiempy.core.types.NitroObject",
"url":3,
"doc":"Base class for all nitro objects. All objects have a reference to the single  msiempy.core.session.NitroSession object that handle the esm requests. Creates the object session."
},
{
"ref":"msiempy.core.types.NitroObject.NitroJSONEncoder",
"url":3,
"doc":"Custom JSON encoder that will use the approprtiate propertie depending of the type of NitroObject. TODO support json json dumping of QueryFilers, may be by making them inherits from NitroDict."
},
{
"ref":"msiempy.core.types.NitroObject.text",
"url":3,
"doc":"Returns printable string. Abstract declaration."
},
{
"ref":"msiempy.core.types.NitroObject.json",
"url":3,
"doc":"Returns json string representation. Abstract declaration."
},
{
"ref":"msiempy.core.types.NitroObject.refresh",
"url":3,
"doc":"Re-load the object. Abstract declaration.",
"func":1
},
{
"ref":"msiempy.core.types.NitroObject.nitro",
"url":3,
"doc":" msiempy.core.session.NitroSession object. Interface to the SIEM."
},
{
"ref":"msiempy.core.types.NitroDict",
"url":3,
"doc":"Dict-Like object (Base class) to represent SIEM data. Exemple :  Event ,  Alarm , etc . Load the data from the SIEM if  id is specified. This classe and subclasses fully implements  dict interface and is suitable for dictionnary operations, see: https: docs.python.org/3/library/stdtypes.html mapping-types-dict Arguments: -  adict : dict object to wrap., typically received from the SIEM. -  id : ESM obejct unique identifier.  Alert.IPSIDAlertID for exemple."
},
{
"ref":"msiempy.core.types.NitroDict.json",
"url":3,
"doc":"JSON representation of a item"
},
{
"ref":"msiempy.core.types.NitroDict.text",
"url":3,
"doc":"Text list of item's values"
},
{
"ref":"msiempy.core.types.NitroDict.data_from_id",
"url":3,
"doc":"This method retreive the item infos from an object ID. Abstract declaration.",
"func":1
},
{
"ref":"msiempy.core.types.NitroDict.get_id",
"url":3,
"doc":"Return the object ID. Abstract definition.",
"func":1
},
{
"ref":"msiempy.core.types.NitroDict.NitroJSONEncoder",
"url":3,
"doc":"Custom JSON encoder that will use the approprtiate propertie depending of the type of NitroObject. TODO support json json dumping of QueryFilers, may be by making them inherits from NitroDict."
},
{
"ref":"msiempy.core.types.NitroDict.refresh",
"url":3,
"doc":"Re-load the object. Abstract declaration.",
"func":1
},
{
"ref":"msiempy.core.types.NitroDict.nitro",
"url":3,
"doc":" msiempy.core.session.NitroSession object. Interface to the SIEM."
},
{
"ref":"msiempy.core.types.NitroList",
"url":3,
"doc":"Base class for list objects. It offers search and other data list actions. This classe and subclasses fully implements  list interface and is suitable for list operations, see: https: docs.python.org/3/library/stdtypes.html sequence-types-list-tuple-range Concrete classes have to cast the list items in their  __init__ method ! Subclassing requirements: Subclasses of UserList are expected to offer a constructor which can be called with either no arguments or one argument. List operations which return a new sequence attempt to create an instance of the actual implementation class. To do so, it assumes that the constructor can be called with a single parameter, which is a sequence object used as a data source. If a derived class does not wish to comply with this requirement, all of the special methods supported by this class will need to be overridden; please consult the sources for information about the methods which need to be provided in that case. See: https: docs.python.org/3.8/library/collections.html?highlight=userdict userlist-objects Arguments: -  alist : list object to wrap."
},
{
"ref":"msiempy.core.types.NitroList.keys",
"url":3,
"doc":"Set of keys for all dict",
"func":1
},
{
"ref":"msiempy.core.types.NitroList.get_text",
"url":3,
"doc":"Return a csv or table string representation of the list Arguments: -  format : prettytable: Returns a table generated by prettytable csv: Returns data with header and comma separated values. -  fields : list of fields you want in the table. If  None : default fields are returned by .keys attribute and sorted. -  max_column_width : when using prettytable only -  get_text_nest_attr : attributes passed to the nested  msiempy.core.types.NitroList.get_text elements if any. Useful to control events appearence.",
"func":1
},
{
"ref":"msiempy.core.types.NitroList.text",
"url":3,
"doc":"Defaut table string, a shorcut to  get_text() with no arguments."
},
{
"ref":"msiempy.core.types.NitroList.json",
"url":3,
"doc":"JSON list of dicts representing the list."
},
{
"ref":"msiempy.core.types.NitroList.search",
"url":3,
"doc":"Return a list of elements that matches one or more regex patterns. Patterns are applied one after another Use  | inside patterns to search with logic OR. This method will return a new NitroList with matching data. NitroDicts in the returned NitroList do not references the items in the original NitroList. Arguments: -  pattern : List or string regex patterns to look for. Each -  invert : Weither or not to invert the search and return elements that doesn't not match search. -  match_prop : Propertie that is going to be called to search. Could be  text or  json . If you wish to apply more specific filters to NitroList list, please use filter(), list comprehension, or other filtering method. i.e. :  [item for item in list if item['cost'] > 50] More on regex https: docs.python.org/3/library/re.html re.Pattern.search",
"func":1
},
{
"ref":"msiempy.core.types.NitroList.refresh",
"url":3,
"doc":"Execute refresh function on all items.",
"func":1
},
{
"ref":"msiempy.core.types.NitroList.perform",
"url":3,
"doc":"Wrapper arround executable and the a list of elements, typically  msiempy.core.types.NitroList object. Arguments: -  func : callable function.  func is going to be called like  func(item,  func_args) on all items in data. This function can be stateless (static) or statefull (first argument is  self ), it doesn't really matter as the element will always be passed as the first argument of the function. On thing really important, the function must not set/delete/change any global variable, as a result, you'll see your varible beeing potentially corrupted or chalenged with conccurent accesses. -  data : if stays  None , will perform the action on itself ( list(self) ) else it will perfom the action on the  data list. -  func_args : arguments that will be passed by default to  func in all calls. -  confirm : will ask interactively confirmation. -  asynch : execute the task asynchronously with  concurrent.futures.ThreadPoolExecutor . It will create a new executor object, so be carefull not to nest 2 asynchronous executions within eachother, it will be a mess. -  workers : number of parrallel tasks, mandatory if asynch is true. -  progress : to show progress bar with ETA (tqdm). -  message : To show to the user. This method is where the core of asynchronous tasks resides.  func will be executed on all  data elements. Basically, if  asynch True , will return : returned=list(concurrent.futures.ThreadPoolExecutor( max_workers=workers ).map( func, data if  asynch False , will iterate and return : for index_or_item in data: returned.append(func(index_or_item Returns a list of returned results.",
"func":1
},
{
"ref":"msiempy.core.types.NitroList.NitroJSONEncoder",
"url":3,
"doc":"Custom JSON encoder that will use the approprtiate propertie depending of the type of NitroObject. TODO support json json dumping of QueryFilers, may be by making them inherits from NitroDict."
},
{
"ref":"msiempy.core.types.NitroList.nitro",
"url":3,
"doc":" msiempy.core.session.NitroSession object. Interface to the SIEM."
},
{
"ref":"msiempy.core.utils",
"url":7,
"doc":"A few quick static util methods."
},
{
"ref":"msiempy.core.utils.dehexify",
"url":7,
"doc":"A URL and Hexadecimal Decoding Library. Credit: Larry Dewey. In the case of the SIEM API, this is used only when dealing with the pricate API calls.",
"func":1
},
{
"ref":"msiempy.core.utils.tob64",
"url":7,
"doc":"Encode a string to base64 almost like  echo '123' | base64 would do.",
"func":1
},
{
"ref":"msiempy.core.utils.fromb64",
"url":7,
"doc":"Decode a string to base64 almost like  echo 'MTIzCg ' | base64  decode would do.",
"func":1
},
{
"ref":"msiempy.core.utils.timerange_gettimes",
"url":7,
"doc":"Convert a string time range to a tuple of datetime objects. Only works for certain time ranges.",
"func":1
},
{
"ref":"msiempy.core.utils.divide_times",
"url":7,
"doc":"\" Divide the time range based on another time, a delta or on a number of slots. Return list of tuple",
"func":1
},
{
"ref":"msiempy.core.utils.regex_match",
"url":7,
"doc":"",
"func":1
},
{
"ref":"msiempy.core.utils.format_esm_time",
"url":7,
"doc":"Converts time object to ESM time string. Arguments: time_obj {[type]}  [description] Returns: time string in format: 2019-04-08T19:35:02.971Z",
"func":1
},
{
"ref":"msiempy.core.utils.convert_to_time_obj",
"url":7,
"doc":"Converts given timestamp string to datetime object Args: time_str: timestamp in format 'YYYY/MM/DD HH:MM:SS', 'MM/DD/YYYY HH:MM:SS', or 'DD/MM/YYYY HH:MM:SS' Returns: datetime object or None if no format matches",
"func":1
},
{
"ref":"msiempy.core.utils.parse_query_result",
"url":7,
"doc":"For input : columns = ['key1','name','password'] rows = [ ['67','bob','b08b'], ['68','mike','kaas'], ['69','jean','p992'], ] Returns : [ {key1=67, name=bob, password=b08b}, { .}, {}, ]",
"func":1
},
{
"ref":"msiempy.core.utils.format_fields_for_query",
"url":7,
"doc":"Format fields names to cann query module. Arguments: -  fields : list of fields, i.e.  ['field1','name','user'] Returns: [ {'name':'field1'}, {'name':'name'}, {'name':'user'}, ]",
"func":1
},
{
"ref":"msiempy.core.utils.parse_timedelta",
"url":7,
"doc":"Parse a time string e.g. (2h13m) into a timedelta object. Modified from virhilo's answer at https: stackoverflow.com/a/4628148/851699 :param time_str: A string identifying a duration. (eg. 2h13m) :return datetime.timedelta: A datetime.timedelta object",
"func":1
},
{
"ref":"msiempy.core.utils.nitro_tz",
"url":7,
"doc":"Maps McAfee SIEM/Nitro ESM internal timezone IDs to the tz database at: http: web.cs.ucla.edu/~eggert/tz/tz-link.htm Args: tz_id (str/int): McAfee ESM internal timezone ID Returns: timezone name (str)",
"func":1
},
{
"ref":"msiempy.device",
"url":8,
"doc":"Provide ESM, Receiver and Datasource management."
},
{
"ref":"msiempy.device.ESM",
"url":8,
"doc":"Enterprise Security Manager interface"
},
{
"ref":"msiempy.device.ESM.text",
"url":8,
"doc":"Returns printable string. Abstract declaration."
},
{
"ref":"msiempy.device.ESM.json",
"url":8,
"doc":"Returns json string representation. Abstract declaration."
},
{
"ref":"msiempy.device.ESM.refresh",
"url":8,
"doc":"Re-load the object. Abstract declaration.",
"func":1
},
{
"ref":"msiempy.device.ESM.time",
"url":8,
"doc":"Returns: string of ESM time (GMT) Example:  2017-07-06T12:21:59.0+0000 ",
"func":1
},
{
"ref":"msiempy.device.ESM.buildstamp",
"url":8,
"doc":"Returns: buildstamp string Example:  10.0.2 20170516001031 ",
"func":1
},
{
"ref":"msiempy.device.ESM.version",
"url":8,
"doc":"Returns: simple version string Example:  10.1.0 ",
"func":1
},
{
"ref":"msiempy.device.ESM.status",
"url":8,
"doc":"Returns:  dict ESM statuses including : -  cpu , example:  Avail: 7977MB, Used: 7857MB, Free: 119MB -  hdd , example:  sda3 Size: 491GB, Used: 55GB(12%), Available: 413GB, Mount: / -  ram -  callHomeIp -  autoBackupEnabled -  autoBackupHour -  autoBackupDay -  backupNextTime -  backupLastTime -  rulesAndSoftwareCheckEnabled -  rulesAndSoftNextCheck -  rulesAndSoftLastCheck Other functions exist to return subsets of this data also.",
"func":1
},
{
"ref":"msiempy.device.ESM.disks",
"url":8,
"doc":"Returns:  self.status()['hdd'] ",
"func":1
},
{
"ref":"msiempy.device.ESM.ram",
"url":8,
"doc":"Returns:  self.status()['ram'] ",
"func":1
},
{
"ref":"msiempy.device.ESM.backup_status",
"url":8,
"doc":"Returns: Backup status and timestamps. Example :   {'autoBackupEnabled': True, 'autoBackupDay': 7, 'autoBackupHour': 0, 'backupLastTime': '07/03/2017 08:59:36', 'backupNextTime': '07/10/2017 08:59'}  ",
"func":1
},
{
"ref":"msiempy.device.ESM.callhome",
"url":8,
"doc":"Returns:  True/False if there is currently a callhome connection",
"func":1
},
{
"ref":"msiempy.device.ESM.rules_status",
"url":8,
"doc":"Returns: Rules autocheck status and timestamps. Example:   { 'rulesAndSoftwareCheckEnabled': True 'rulesAndSoftLastCheck': '07/06/2017 10:28:43', 'rulesAndSoftNextCheck': '07/06/2017 22:28:43',}  ",
"func":1
},
{
"ref":"msiempy.device.ESM.get_alerts",
"url":8,
"doc":"Tells the ESM to retrieve alerts from the provided device ID. Arguments: -  ds_id : ( str )  IPSID for the device, e.g.  144116287587483648 -  flows : ( bool ) Also get flows from the device (default: False) Returns:  None  TODO: add test method in tests/auth/test_device.py",
"func":1
},
{
"ref":"msiempy.device.ESM.recs",
"url":8,
"doc":"Returns:  list(tuple(  , List of receivers name and id",
"func":1
},
{
"ref":"msiempy.device.ESM.tz_offsets",
"url":8,
"doc":"Builds table of ESM timezones including offsets. Returns:  list(tuple(  , List of timezone  tuples(name, id, offset) Example: [(1, 'Midway Island, Samoa', '-11:00'), (2, 'Hawaii', '-10:00'),  . ]",
"func":1
},
{
"ref":"msiempy.device.ESM.timezones",
"url":8,
"doc":"Builds table of ESM timezones and names only. No offsets. Returns:  dict :  {timezone_id:timezone_name,  .} ",
"func":1
},
{
"ref":"msiempy.device.ESM.tz_name_to_id",
"url":8,
"doc":"Arguments: -  tz_name : ( str ) Case sensitive, exact match timezone name Returns:  str , Timezone id or  None if there is no match",
"func":1
},
{
"ref":"msiempy.device.ESM.tz_id_to_name",
"url":8,
"doc":"Arguments: -  td_id : ( str ) Numerical string (Currently  1 to  74 ) Returns:  str Timezone name or  None if there is no match",
"func":1
},
{
"ref":"msiempy.device.ESM.type_id_to_venmod",
"url":8,
"doc":"Arguments: -  type_id : ( str ) Numerical string Returns:  tuple(vendor, model) or  None if there is no match",
"func":1
},
{
"ref":"msiempy.device.ESM.venmod_to_type_id",
"url":8,
"doc":"Arguments: -  vendor : ( str ) Exact vendor string including puncuation -  model : ( str ) Exact model string including puncuation Returns:  str Matching type_id or None if there is no match",
"func":1
},
{
"ref":"msiempy.device.ESM.rules_history",
"url":8,
"doc":"Returns: Policy Editor rule history.",
"func":1
},
{
"ref":"msiempy.device.ESM.NitroJSONEncoder",
"url":3,
"doc":"Custom JSON encoder that will use the approprtiate propertie depending of the type of NitroObject. TODO support json json dumping of QueryFilers, may be by making them inherits from NitroDict."
},
{
"ref":"msiempy.device.ESM.nitro",
"url":3,
"doc":" msiempy.core.session.NitroSession object. Interface to the SIEM."
},
{
"ref":"msiempy.device.DevTree",
"url":8,
"doc":"List-Like object. ESM device tree interface. -  __contains__ method returns: ( bool )  True/None the name or IP matches the provided search term. Exemple:    "
},
{
"ref":"msiempy.device.DevTree.search",
"url":8,
"doc":"Arguments: -  term ( str ): Datasource name, IP, hostname or ds_id. Matching the  name ,  IPv4/IPv6 address ,  hostname or  device ID . -  zone_id ( int ): Provide zone_id to limit search to a specific zone Returns:  Datasource object that matches the provided search term or None.",
"func":1
},
{
"ref":"msiempy.device.DevTree.search_ds_group",
"url":8,
"doc":"Arguments: -  field ( str ): Valid DS config field to search -  term ( str ): Data to search for in specified field Valid field options include: -  parent_id = '144119615532826624' -  type_id = '65' -  vendor = 'Intersect Alliance' -  model = 'Snare for Windows' -  require_tls = 'T' -  port = '514' -  tz_id = '51' -  tz_name = 'Darwin' -  zone_id = '7' Returns:  Generator ( list() ) containing any matching  DataSource objects or  None Result must be iterated through. Raises:  ValueError : if field or term are None",
"func":1
},
{
"ref":"msiempy.device.DevTree.refresh",
"url":8,
"doc":"Rebuilds the devtree",
"func":1
},
{
"ref":"msiempy.device.DevTree.recs",
"url":8,
"doc":"Returns:  list of Receiver  dict ",
"func":1
},
{
"ref":"msiempy.device.DevTree.build_devtree",
"url":8,
"doc":"Coordinates assembly of the devtree object",
"func":1
},
{
"ref":"msiempy.device.DevTree.duplicate_datasource",
"url":8,
"doc":"Check for duplicate dataname name or IP address. Arguments: -  ds_params (dict) : datasource params  ds_params should contain followinf keys : -  name (str): datasource name -  ds_ip (str): datasource IP -  zone_id (str): optional zone_id",
"func":1
},
{
"ref":"msiempy.device.DevTree.add",
"url":8,
"doc":"Adds a datasource. Arguments: -  attr ( dict ): datasource attributes  attr should contain following keys : -  client ( bool ): designate a client datasource (not child) -  name ( str ): name of datasource (req) -  parent_id ( str ): id of parent device (req) -  ds_ip ( str ): ip of datasource (ip or hostname required) -  hostname ( str ): hostname of datasource -  type_id ( str ): type of datasource (req) -  enabled ( bool ): enabled or not (default: True) -  tz_id ( str ): timezone of datasource (default UTC: 8) -  zone_id ( str ): numberic ESM id for zone (default: 0) Examples ( tz_id only): PST: 27, MST: 12, CST: 11, EST: 32 -  require_tls ( bool ): datasource uses syslog tls Returns: result id ( str ): id of the result. Not the ds_id as of 11.2.1 or  None on Error",
"func":1
},
{
"ref":"msiempy.device.DevTree.add_client",
"url":8,
"doc":"Add a datasource client Arguments: -  attr ( dict ) : datasource attributes  attr should contain following keys : -  parent_id ( str ): datasource id of the client group datasource -  name ( str ): name of the client -  enabled ( bool ): enabled or not (default:  True ) -  ds_ip ( str ): IP address for client -  hostname ( str ): hostname for client -  type_id ( str ): numeric ESM type-id -  tz_id ( str ): numeric ESM timezone id or GMT -  dorder ( str ): Date order -  maskflag ( str ): -  port ( str ): IP port to use -  require_tls ( bool ): use syslog-TLS (default:  False ) Returns: result id ( str ) or  None on Error",
"func":1
},
{
"ref":"msiempy.device.DevTree.keys",
"url":3,
"doc":"Set of keys for all dict",
"func":1
},
{
"ref":"msiempy.device.DevTree.get_text",
"url":3,
"doc":"Return a csv or table string representation of the list Arguments: -  format : prettytable: Returns a table generated by prettytable csv: Returns data with header and comma separated values. -  fields : list of fields you want in the table. If  None : default fields are returned by .keys attribute and sorted. -  max_column_width : when using prettytable only -  get_text_nest_attr : attributes passed to the nested  msiempy.core.types.NitroList.get_text elements if any. Useful to control events appearence.",
"func":1
},
{
"ref":"msiempy.device.DevTree.text",
"url":3,
"doc":"Defaut table string, a shorcut to  get_text() with no arguments."
},
{
"ref":"msiempy.device.DevTree.json",
"url":3,
"doc":"JSON list of dicts representing the list."
},
{
"ref":"msiempy.device.DevTree.perform",
"url":3,
"doc":"Wrapper arround executable and the a list of elements, typically  msiempy.core.types.NitroList object. Arguments: -  func : callable function.  func is going to be called like  func(item,  func_args) on all items in data. This function can be stateless (static) or statefull (first argument is  self ), it doesn't really matter as the element will always be passed as the first argument of the function. On thing really important, the function must not set/delete/change any global variable, as a result, you'll see your varible beeing potentially corrupted or chalenged with conccurent accesses. -  data : if stays  None , will perform the action on itself ( list(self) ) else it will perfom the action on the  data list. -  func_args : arguments that will be passed by default to  func in all calls. -  confirm : will ask interactively confirmation. -  asynch : execute the task asynchronously with  concurrent.futures.ThreadPoolExecutor . It will create a new executor object, so be carefull not to nest 2 asynchronous executions within eachother, it will be a mess. -  workers : number of parrallel tasks, mandatory if asynch is true. -  progress : to show progress bar with ETA (tqdm). -  message : To show to the user. This method is where the core of asynchronous tasks resides.  func will be executed on all  data elements. Basically, if  asynch True , will return : returned=list(concurrent.futures.ThreadPoolExecutor( max_workers=workers ).map( func, data if  asynch False , will iterate and return : for index_or_item in data: returned.append(func(index_or_item Returns a list of returned results.",
"func":1
},
{
"ref":"msiempy.device.DevTree.NitroJSONEncoder",
"url":3,
"doc":"Custom JSON encoder that will use the approprtiate propertie depending of the type of NitroObject. TODO support json json dumping of QueryFilers, may be by making them inherits from NitroDict."
},
{
"ref":"msiempy.device.DevTree.nitro",
"url":3,
"doc":" msiempy.core.session.NitroSession object. Interface to the SIEM."
},
{
"ref":"msiempy.device.DataSource",
"url":8,
"doc":"Dict-Like object. DataSources are best instantiated from DevTree():   >>> dt = DevTree() >>> ds = dt[25] or >>> ds = dt.search('10.10.1.1')   Dict keys: -  name ( str ): name of the datasource -  ds_ip ( str ): IP of the datasource -  hostname ( str ): hostname for the datasource -  ds_id ( str ): internal datasource ID (e.g  144234544545444 ) -  type_id ( str ): numeric internal datasource type id -  desc_id ( str ): always '3' a datasource or '254' for a client -  parent_id ( str ): internal ds_id for the parent device -  parent_name ( str ): name of the parent device -  enabled ( str ): 'T' or 'F' -  client ( bool ): Client datasource or not -  zone_id ( str ): numeric zone_id -  zone_name ( str ): name of the zone -  tz_id ( str ): internal numeric timezone ID -  vendor ( str ): vendor of datasource (e.g. Microsoft) -  model ( str ): model of datasource (e.g. Windows) -  require_tls ( str ): Use syslog over TLS -  url ( str ): URL of the datasource Arguments: -  adict : Datasource parameters -  id : The datasource ID to instanciate. Will load informations"
},
{
"ref":"msiempy.device.DataSource.data_from_id",
"url":8,
"doc":"Gets full of the DataSource parameters",
"func":1
},
{
"ref":"msiempy.device.DataSource.load_details",
"url":8,
"doc":"DataSource object is lazy. This gets the rest of the parameters.",
"func":1
},
{
"ref":"msiempy.device.DataSource.refresh",
"url":8,
"doc":"Gets the detailed parameters.",
"func":1
},
{
"ref":"msiempy.device.DataSource.delete",
"url":8,
"doc":"This deletes the datasource and all the data. Be careful.",
"func":1
},
{
"ref":"msiempy.device.DataSource.delete_client",
"url":8,
"doc":"This deletes the datasource's clients and all the data. Be careful.",
"func":1
},
{
"ref":"msiempy.device.DataSource.get_id",
"url":8,
"doc":"Returns the Datasource ID.",
"func":1
},
{
"ref":"msiempy.device.DataSource.json",
"url":3,
"doc":"JSON representation of a item"
},
{
"ref":"msiempy.device.DataSource.text",
"url":3,
"doc":"Text list of item's values"
},
{
"ref":"msiempy.device.DataSource.NitroJSONEncoder",
"url":3,
"doc":"Custom JSON encoder that will use the approprtiate propertie depending of the type of NitroObject. TODO support json json dumping of QueryFilers, may be by making them inherits from NitroDict."
},
{
"ref":"msiempy.device.DataSource.nitro",
"url":3,
"doc":" msiempy.core.session.NitroSession object. Interface to the SIEM."
},
{
"ref":"msiempy.alarm",
"url":9,
"doc":"Provide alarm management."
},
{
"ref":"msiempy.alarm.AlarmManager",
"url":9,
"doc":"Interface to query and manage Alarms. Inherits from  msiempy.core.query.FilteredQueryList . Arguments: -  status_filter : status of the alarms to query.  status_filter is not a filter like other cause it's computed on the SIEM side. Accepted values :  acknowledged ,  unacknowledged ,  all ,  or  None (default is  ).  filters are computed locally - Unlike  msiempy.event.EventManager filters. -  page_size : max number of rows per query. -  page_number : defaulted to 1. -  filters :  [(field, [values]), (field, [values])] Filters applied to  msiempy.alarm.Alarm objects. A single  tuple is also accepted. -  event_filters :  [(field, [values]), (field, [values])] Filters applied to  msiempy.event.Event objects. A single  tuple is also accepted. -  time_range : Query time range. String representation of a time range. -  start_time : Query starting time, can be a  string or a  datetime object. Parsed with  dateutil . -  end_time : Query endding time, can be a  string or a  datetime object. Parsed with  dateutil .  Unlike  EventManager , filters are computed after the data loaded with regex matching. "
},
{
"ref":"msiempy.alarm.AlarmManager.filters",
"url":9,
"doc":"The alarm related filters"
},
{
"ref":"msiempy.alarm.AlarmManager.status_filter",
"url":9,
"doc":"\" Alarms status filter"
},
{
"ref":"msiempy.alarm.AlarmManager.add_filter",
"url":9,
"doc":"Add a filter to the query. Arguments : -  afilter : Can be a a tuple  (field, [values]) or  (field, value) or  str 'field=value' Filters format is  tuple(field, [values]) .",
"func":1
},
{
"ref":"msiempy.alarm.AlarmManager.event_filters",
"url":9,
"doc":"Event related filters."
},
{
"ref":"msiempy.alarm.AlarmManager.add_event_filter",
"url":9,
"doc":"Add a event filter to the query. Arguments : -  afilter : Can be a a tuple  (field, [values]) or  (field, value) or  str 'field=value' Filters format is  tuple(field, [values]) .",
"func":1
},
{
"ref":"msiempy.alarm.AlarmManager.clear_filters",
"url":9,
"doc":"Reset local alarm and event filters.",
"func":1
},
{
"ref":"msiempy.alarm.AlarmManager.load_data",
"url":9,
"doc":"Load the data into the list. Implements automatic paging over  msiempy.alarm.AlarmManager.qry_load_data . Default behaviour is to load all alarms informations. Meaning that foreach alarms, the full details is loaded, then the trigerring event details is loaded. Arguments : -  pages : Number of pages to load (not asynchronous). Arguments passed to  msiempy.alarm.AlarmManager.qry_load_data : -  workers : Number of asynchronous workers -  alarms_details : Load detailed alarms infos. If  False , only a couple values are loaded, no  events infos. -  events_details : Load detailed events infos. If  False , no detailed  events will be loaded. Only  str representation for SIEM 10.x and minimal events records from SIEM 11.x. -  use_query : Uses the query module to retreive event data. Only works with SIEM v11.2.1 or greater. Default behaviour will call  ipsGetAlertData to retreive the complete event definition. -  extra_fields : Only when  use_query=True . Additionnal event fields to load in the query. See :  msiempy.event.EventManager -  page_number : Page number, default to 1. Do not touch if you're using  pages parameter Returns :  msiempy.alarm.AlarmManager ",
"func":1
},
{
"ref":"msiempy.alarm.AlarmManager.qry_load_data",
"url":9,
"doc":"Method that query, filter and return the alarms data : -> Fetch the list of alarms and load alarms details -> Filter depending on alarms related filters -> Load the events details -> Filter depending on event related filters Arguments : -  workers : Number of asynchronous workers -  alarms_details : Load detailed alarms infos. If  False , only a couple values are loaded, no  events infos. -  events_details : Load detailed events infos. If  False , no detailed  events will be loaded only  str representation. -  use_query : Uses the query module to retreive event data. Only works with SIEM v11.2.1 or greater. -  extra_fields : Only when  use_query=True . Additionnal event fields to load in the query. See :  msiempy.event.EventManager -  page_number : Page number, default to 1. Do not touch if you're using  pages parameter Returns :  tuple : ( Results :  list , Status of the query :  completed )",
"func":1
},
{
"ref":"msiempy.alarm.AlarmManager.page_size",
"url":9,
"doc":"\" Max number of alarms per query"
},
{
"ref":"msiempy.alarm.AlarmManager.time_range",
"url":2,
"doc":"Query time range. See  msiempy.core.query.FilteredQueryList.POSSIBLE_TIME_RANGE . Default to  msiempy.core.query.FilteredQueryList.DEFAULT_TIME_RANGE (CURRENT_DAY). Note that the time range is upper cased automatically. Raises  VallueError if unrecognized time range is set and  AttributeError if not the right type."
},
{
"ref":"msiempy.alarm.AlarmManager.start_time",
"url":2,
"doc":"Start time of the query in the right SIEM format. Use  _start_time to get the datetime object. You can set the  star_time as a  str or a  datetime . If  None , equivalent CURRENT_DAY start 00:00:00. Raises:  ValueError if not the right type."
},
{
"ref":"msiempy.alarm.AlarmManager.end_time",
"url":2,
"doc":"End time of the query in the right SIEM format. Use  _end_time property to get the datetime object. You can set the  end_time as a  str or a  datetime . If  None , equivalent CURRENT_DAY. Raises  ValueError if not the right type."
},
{
"ref":"msiempy.alarm.AlarmManager.keys",
"url":3,
"doc":"Set of keys for all dict",
"func":1
},
{
"ref":"msiempy.alarm.AlarmManager.get_text",
"url":3,
"doc":"Return a csv or table string representation of the list Arguments: -  format : prettytable: Returns a table generated by prettytable csv: Returns data with header and comma separated values. -  fields : list of fields you want in the table. If  None : default fields are returned by .keys attribute and sorted. -  max_column_width : when using prettytable only -  get_text_nest_attr : attributes passed to the nested  msiempy.core.types.NitroList.get_text elements if any. Useful to control events appearence.",
"func":1
},
{
"ref":"msiempy.alarm.AlarmManager.text",
"url":3,
"doc":"Defaut table string, a shorcut to  get_text() with no arguments."
},
{
"ref":"msiempy.alarm.AlarmManager.json",
"url":3,
"doc":"JSON list of dicts representing the list."
},
{
"ref":"msiempy.alarm.AlarmManager.search",
"url":3,
"doc":"Return a list of elements that matches one or more regex patterns. Patterns are applied one after another Use  | inside patterns to search with logic OR. This method will return a new NitroList with matching data. NitroDicts in the returned NitroList do not references the items in the original NitroList. Arguments: -  pattern : List or string regex patterns to look for. Each -  invert : Weither or not to invert the search and return elements that doesn't not match search. -  match_prop : Propertie that is going to be called to search. Could be  text or  json . If you wish to apply more specific filters to NitroList list, please use filter(), list comprehension, or other filtering method. i.e. :  [item for item in list if item['cost'] > 50] More on regex https: docs.python.org/3/library/re.html re.Pattern.search",
"func":1
},
{
"ref":"msiempy.alarm.AlarmManager.refresh",
"url":3,
"doc":"Execute refresh function on all items.",
"func":1
},
{
"ref":"msiempy.alarm.AlarmManager.perform",
"url":3,
"doc":"Wrapper arround executable and the a list of elements, typically  msiempy.core.types.NitroList object. Arguments: -  func : callable function.  func is going to be called like  func(item,  func_args) on all items in data. This function can be stateless (static) or statefull (first argument is  self ), it doesn't really matter as the element will always be passed as the first argument of the function. On thing really important, the function must not set/delete/change any global variable, as a result, you'll see your varible beeing potentially corrupted or chalenged with conccurent accesses. -  data : if stays  None , will perform the action on itself ( list(self) ) else it will perfom the action on the  data list. -  func_args : arguments that will be passed by default to  func in all calls. -  confirm : will ask interactively confirmation. -  asynch : execute the task asynchronously with  concurrent.futures.ThreadPoolExecutor . It will create a new executor object, so be carefull not to nest 2 asynchronous executions within eachother, it will be a mess. -  workers : number of parrallel tasks, mandatory if asynch is true. -  progress : to show progress bar with ETA (tqdm). -  message : To show to the user. This method is where the core of asynchronous tasks resides.  func will be executed on all  data elements. Basically, if  asynch True , will return : returned=list(concurrent.futures.ThreadPoolExecutor( max_workers=workers ).map( func, data if  asynch False , will iterate and return : for index_or_item in data: returned.append(func(index_or_item Returns a list of returned results.",
"func":1
},
{
"ref":"msiempy.alarm.AlarmManager.NitroJSONEncoder",
"url":3,
"doc":"Custom JSON encoder that will use the approprtiate propertie depending of the type of NitroObject. TODO support json json dumping of QueryFilers, may be by making them inherits from NitroDict."
},
{
"ref":"msiempy.alarm.AlarmManager.nitro",
"url":3,
"doc":" msiempy.core.session.NitroSession object. Interface to the SIEM."
},
{
"ref":"msiempy.alarm.Alarm",
"url":9,
"doc":"Dict-Like object. Common keys : -  id : The ID of the triggered alarm -  summary : The summary of the triggered alarm -  assignee : The assignee for this triggered alarm -  severity : The severity for this triggered alarm -  triggeredDate : The date this alarm was triggered -  acknowledgedDate : The date this triggered alarm was acknowledged -  acknowledgedUsername : The user that acknowledged this triggered alarm -  alarmName : The name of the alarm that was triggered -  events : The events that triggered the alarm - And others . Arguments: -  adict : Alarm parameters -  id : The alarm ID to instanciate. Will load informations Creates a empty Alarm."
},
{
"ref":"msiempy.alarm.Alarm.POSSIBLE_ALARM_STATUS",
"url":9,
"doc":"Possible alarm statuses :  acknowledged/ack, unacknowledged/unack, /all/both "
},
{
"ref":"msiempy.alarm.Alarm.ALARM_EVENT_FILTER_FIELDS",
"url":9,
"doc":""
},
{
"ref":"msiempy.alarm.Alarm.ALARM_DEFAULT_FIELDS",
"url":9,
"doc":"Defaulfs fields :  id, alarmName, summary, triggeredDate, acknowledgedUsername (not used in library, can bu useful for printing with  get_text(fields=msiempy.alarm.ALARM_DEFAULT_FIELDS) )"
},
{
"ref":"msiempy.alarm.Alarm.acknowledge",
"url":9,
"doc":"Mark the alarm as acknowledged.",
"func":1
},
{
"ref":"msiempy.alarm.Alarm.unacknowledge",
"url":9,
"doc":"Mark the alarm as unacknowledge.",
"func":1
},
{
"ref":"msiempy.alarm.Alarm.delete",
"url":9,
"doc":"Destructive action! Delete the alarm.",
"func":1
},
{
"ref":"msiempy.alarm.Alarm.ceate_case",
"url":9,
"doc":"Not implemented : TODO",
"func":1
},
{
"ref":"msiempy.alarm.Alarm.load_details",
"url":9,
"doc":"Update the alarm with detailled data loaded from the SIEM.",
"func":1
},
{
"ref":"msiempy.alarm.Alarm.refresh",
"url":9,
"doc":"Update the alarm with detailled data loaded from the SIEM.",
"func":1
},
{
"ref":"msiempy.alarm.Alarm.load_events",
"url":9,
"doc":"Retreive the complete trigerring Event objects from an Alarm. This methos is automatically called automatically bu default when calling  load_data() . Arguments: -  use_query : Uses the query module to retreive common event data. Only works with SIEM v 11.2 or greater. Default behaviour will call  ipsGetAlertData to retreive the complete event definition. -  extra_fields : Only when  use_query=True . Additionnal event fields to load in the query. See :  msiempy.event.EventManager  Warning On SIEM v10.X This method will only load the details of the first triggering event.",
"func":1
},
{
"ref":"msiempy.alarm.Alarm.ALARM_FIELDS_MAP",
"url":9,
"doc":"List of all  Alarm possible fields. This is used only when the private API is used to retreive Alarm infos. To change genuine (UPPERCASE) key names to more explicit ones matching public API names."
},
{
"ref":"msiempy.alarm.Alarm.map_alarm_int_fields",
"url":9,
"doc":"Map the internal ESM field names to msiempy style with  msiempy.alarm.Alarm.ALARM_FIELDS_MAP . Converts \"T\" and \"F\" to  True and  False and handle None values.",
"func":1
},
{
"ref":"msiempy.alarm.Alarm.data_from_id",
"url":9,
"doc":"Gets the alarm parameters based on an ID. Will still use private method if SIEM if v10.X because it's the only way to get the trigerring event ID. Arguments: -  use_priv : ( bool ): Use the private API methods to retreive the INFO, will use it anyway with ESM v10.x. Will only load the details of the first triggering event.",
"func":1
},
{
"ref":"msiempy.alarm.Alarm.get_id",
"url":9,
"doc":"Return the alarm ID.",
"func":1
},
{
"ref":"msiempy.alarm.Alarm.json",
"url":3,
"doc":"JSON representation of a item"
},
{
"ref":"msiempy.alarm.Alarm.text",
"url":3,
"doc":"Text list of item's values"
},
{
"ref":"msiempy.alarm.Alarm.NitroJSONEncoder",
"url":3,
"doc":"Custom JSON encoder that will use the approprtiate propertie depending of the type of NitroObject. TODO support json json dumping of QueryFilers, may be by making them inherits from NitroDict."
},
{
"ref":"msiempy.alarm.Alarm.nitro",
"url":3,
"doc":" msiempy.core.session.NitroSession object. Interface to the SIEM."
},
{
"ref":"msiempy.watchlist",
"url":10,
"doc":"Provide watchlist management."
},
{
"ref":"msiempy.watchlist.WatchlistManager",
"url":10,
"doc":"List-Like object. Summary of ESM watchlists. Example:   wlman = WatchlistManager() for wl in wlman: if wl['name']  'IPs-To-Block-On-IPS-24hrs': break wl.add_values(['1.1.1.2', '2.2.2.1', '3.3.3.1'])   Initialize the watchlist manager."
},
{
"ref":"msiempy.watchlist.WatchlistManager.get_watchlist_summary",
"url":10,
"doc":"Loads the watchlist summary.",
"func":1
},
{
"ref":"msiempy.watchlist.WatchlistManager.load_details",
"url":10,
"doc":"Load the details of existing watchlists.",
"func":1
},
{
"ref":"msiempy.watchlist.WatchlistManager.refresh",
"url":10,
"doc":"Reloads the watchlist summary.",
"func":1
},
{
"ref":"msiempy.watchlist.WatchlistManager.add",
"url":10,
"doc":"Create a static watchlist. Arguments: -  name ( str ): Name of the watchlist. -  wl_type ( str ): Watchlist data type. Get the list of types with:  msiempy.watchlist.WatchlistManager.get_wl_types . Most common types are:  IPAddress ,  Hash ,  SHA1 ,  DSIDSigID ,  Port ,  MacAddress ,  NormID ,  AppID ,  CommandID ,  DomainID ,  HostID ,  ObjectID ,  Filename ,  File_Hash ",
"func":1
},
{
"ref":"msiempy.watchlist.WatchlistManager.remove",
"url":10,
"doc":"Remove watchlist(s). Arguments: -  wl_ids ( list ): list of watchlist IDs. Example:  [1, 2, 3] .",
"func":1
},
{
"ref":"msiempy.watchlist.WatchlistManager.get_wl_types",
"url":10,
"doc":"Get a list of watchlist types. Returns:  list of watchlist types.",
"func":1
},
{
"ref":"msiempy.watchlist.WatchlistManager.keys",
"url":3,
"doc":"Set of keys for all dict",
"func":1
},
{
"ref":"msiempy.watchlist.WatchlistManager.get_text",
"url":3,
"doc":"Return a csv or table string representation of the list Arguments: -  format : prettytable: Returns a table generated by prettytable csv: Returns data with header and comma separated values. -  fields : list of fields you want in the table. If  None : default fields are returned by .keys attribute and sorted. -  max_column_width : when using prettytable only -  get_text_nest_attr : attributes passed to the nested  msiempy.core.types.NitroList.get_text elements if any. Useful to control events appearence.",
"func":1
},
{
"ref":"msiempy.watchlist.WatchlistManager.text",
"url":3,
"doc":"Defaut table string, a shorcut to  get_text() with no arguments."
},
{
"ref":"msiempy.watchlist.WatchlistManager.json",
"url":3,
"doc":"JSON list of dicts representing the list."
},
{
"ref":"msiempy.watchlist.WatchlistManager.search",
"url":3,
"doc":"Return a list of elements that matches one or more regex patterns. Patterns are applied one after another Use  | inside patterns to search with logic OR. This method will return a new NitroList with matching data. NitroDicts in the returned NitroList do not references the items in the original NitroList. Arguments: -  pattern : List or string regex patterns to look for. Each -  invert : Weither or not to invert the search and return elements that doesn't not match search. -  match_prop : Propertie that is going to be called to search. Could be  text or  json . If you wish to apply more specific filters to NitroList list, please use filter(), list comprehension, or other filtering method. i.e. :  [item for item in list if item['cost'] > 50] More on regex https: docs.python.org/3/library/re.html re.Pattern.search",
"func":1
},
{
"ref":"msiempy.watchlist.WatchlistManager.perform",
"url":3,
"doc":"Wrapper arround executable and the a list of elements, typically  msiempy.core.types.NitroList object. Arguments: -  func : callable function.  func is going to be called like  func(item,  func_args) on all items in data. This function can be stateless (static) or statefull (first argument is  self ), it doesn't really matter as the element will always be passed as the first argument of the function. On thing really important, the function must not set/delete/change any global variable, as a result, you'll see your varible beeing potentially corrupted or chalenged with conccurent accesses. -  data : if stays  None , will perform the action on itself ( list(self) ) else it will perfom the action on the  data list. -  func_args : arguments that will be passed by default to  func in all calls. -  confirm : will ask interactively confirmation. -  asynch : execute the task asynchronously with  concurrent.futures.ThreadPoolExecutor . It will create a new executor object, so be carefull not to nest 2 asynchronous executions within eachother, it will be a mess. -  workers : number of parrallel tasks, mandatory if asynch is true. -  progress : to show progress bar with ETA (tqdm). -  message : To show to the user. This method is where the core of asynchronous tasks resides.  func will be executed on all  data elements. Basically, if  asynch True , will return : returned=list(concurrent.futures.ThreadPoolExecutor( max_workers=workers ).map( func, data if  asynch False , will iterate and return : for index_or_item in data: returned.append(func(index_or_item Returns a list of returned results.",
"func":1
},
{
"ref":"msiempy.watchlist.WatchlistManager.NitroJSONEncoder",
"url":3,
"doc":"Custom JSON encoder that will use the approprtiate propertie depending of the type of NitroObject. TODO support json json dumping of QueryFilers, may be by making them inherits from NitroDict."
},
{
"ref":"msiempy.watchlist.WatchlistManager.nitro",
"url":3,
"doc":" msiempy.core.session.NitroSession object. Interface to the SIEM."
},
{
"ref":"msiempy.watchlist.Watchlist",
"url":10,
"doc":"Dict-Like object. Complete list of watchlist fields (not values) once load with load_details() Dictionary keys: -  name : The name of the watchlist -  type : The watchlist type -  customType : The watchlist custom type (custom field) -  dynamic : Whether this watchlist is dynamic -  hidden : Whether this watchlist is hidden -  scored : Whether this watchlist has a scoring component (GTI for example) -  valueCount : The number of values in this watchlist -  active : Whether this watchlist is a active -  errorMsg : The error message, if there is one associated with this watchlist -  source : source -  id : The id of the watchlist -  values : values - And others . Arguments: -  adict : Watchlist parameters -  id : The watchlist ID to instanciate. Will load informations"
},
{
"ref":"msiempy.watchlist.Watchlist.add_values",
"url":10,
"doc":"Add values to static watchlist. Arguments: -  values ( list ): list of values",
"func":1
},
{
"ref":"msiempy.watchlist.Watchlist.data_from_id",
"url":10,
"doc":"Retrieve watchlist details for ID. Arguments: -  id ( str ): watchlist ID",
"func":1
},
{
"ref":"msiempy.watchlist.Watchlist.load_details",
"url":10,
"doc":"Load Watchlist details.",
"func":1
},
{
"ref":"msiempy.watchlist.Watchlist.refresh",
"url":10,
"doc":"Load Watchlist details.",
"func":1
},
{
"ref":"msiempy.watchlist.Watchlist.load_values",
"url":10,
"doc":"Load Watchlist values. Raises:  KeyError if watchlist invalid.",
"func":1
},
{
"ref":"msiempy.watchlist.Watchlist.get_id",
"url":10,
"doc":"Returns the Watchlist ID.",
"func":1
},
{
"ref":"msiempy.watchlist.Watchlist.json",
"url":3,
"doc":"JSON representation of a item"
},
{
"ref":"msiempy.watchlist.Watchlist.text",
"url":3,
"doc":"Text list of item's values"
},
{
"ref":"msiempy.watchlist.Watchlist.NitroJSONEncoder",
"url":3,
"doc":"Custom JSON encoder that will use the approprtiate propertie depending of the type of NitroObject. TODO support json json dumping of QueryFilers, may be by making them inherits from NitroDict."
},
{
"ref":"msiempy.watchlist.Watchlist.nitro",
"url":3,
"doc":" msiempy.core.session.NitroSession object. Interface to the SIEM."
}
]