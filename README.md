# volumio-plugin-pebble-volume
JBL pebble volume control for volumio2

JBL pebble sports a rotating volume control dial.
However the volume level needs to be handled by the host device.
Pebble itself doesn't do anything about the speaker volume
when you rotate the volume dial. 
It simply sends some data to the host as an USB HID device.
This plugin read, parse the data and change the volumio volume.
