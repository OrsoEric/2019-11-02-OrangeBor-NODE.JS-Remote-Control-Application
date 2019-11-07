var SerialPort = require("serialport");

// this is the openImmediately flag [default is true]
var my_uart = new SerialPort
(
	"/dev/ttyS0",
	{
		baudRate: 256000
	},
	false
);

//Test cycle settings
var num_motors = 4;
var max_speed = 55;
var speed_increment = 20;

//Cycle counters
var ramp = 0;
var dir = 0;
var motor = 0;
var speed = 0;

my_uart.on
(
	"open",
	function()
	{
		console.log("Port is open!");
		//Periodically send the current server time to the client in string form
		setInterval
		(
			function()
			{
				//----------------------------------------------
				//	Motor Ramp Generator
				//----------------------------------------------

				//if: accelerate
				if (ramp == 0)
				{
					//increase speed
					speed += speed_increment;
					//if maximum speed
					if (speed >= max_speed)
					{
						//clip speed
						speed = max_speed;
						//decelerate
						ramp = 1;
					}
				}
				//if: decelerate
				else
				{
					//decrease speed
					speed -= speed_increment;
					//if minimum
					if (speed <= 0)
					{
						//clip speed
						speed = 0;
						//accelerate
						ramp = 0;
						//change direction
						dir = 1 -dir;
						//if i did a full cycle
						if (dir == 0)
						{
							//Scan motors
                            motor++;
                            //clip to maximum number of motors
                            if (motor >= num_motors)
							{
								motor = 0;
							}
						}
					}
				}

				//----------------------------------------------
				//	Command sender
				//----------------------------------------------

				//temp counter
				var t;
				//Scan all motors
				for (t=0;t<num_motors;t++)
				{
					//If i'm controlling the indexed motor
					if (motor == t)
					{
						if (dir == 0)
						{
							//operate right motor
							set_dc_motor_pwm( t, speed );
						}
						else
						{
							//operate right motor
							set_dc_motor_pwm( t, -speed );
						}
					}
					//if i'm adressing an idle motor
					else
					{
						set_dc_motor_pwm( t, 0 );
					}

				} //End For: scan motors

			},
			//Send every * [ms]
			300
		);
	}
);

my_uart.on
(
	'data',
	function(data)
	{
		console.log('data received: ' + data);
	}
);

//Send ping message to keep the connection alive
function send_ping( )
{
	my_uart.write
	(
		"P\0",
		function(err, res)
		{
			if (err)
			{
				console.log("err ", err);
			}
		}
	);
}

//Compute the speed message to send to maze runner
function set_dc_motor_pwm( motor_index, vel )
{
	var msg;

	msg = "M" + motor_index + "PWM" + vel + "\0";

	my_uart.write
	(
		msg,
		function(err, res)
		{
			if (err)
			{
				console.log("err ", err);
			}
			else
			{
				console.log("Sent: ", msg);
			}
		}
	);
}
