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

//maximum speed is 13 in this demo version
var ramp = 0;
var dir = 0;
var motor = 0;
var max_speed = 55;
var speed_increment = 10;
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

					//Speed Processor
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
							//Use the other motor
                            motor = 1 -motor;
						}
					}
				}

					//PWM Assign
				//if: right motor
				if (motor == 0)
				{
					if (dir == 0)
					{
						//operate right motor
						set_dc_motor_pwm( speed, 0 );
					}
					else
					{
						//operate right motor
						set_dc_motor_pwm( -speed, 0 );
					}
				}
				//if: left motor
				else
				{
					if (dir == 0)
					{
						//operate right motor
						set_dc_motor_pwm( 0, speed );
					}
					else
					{
						//operate right motor
						set_dc_motor_pwm( 0, -speed );
					}
				}

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
function set_dc_motor_pwm( vel_r, vel_l )
{
	var msg;

	msg = "PWMR" + vel_r + "L" + vel_l + "\0";

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
