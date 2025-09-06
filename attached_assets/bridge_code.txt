***********************************************************************************
(defun opn()
(setq f (open "D:\\gad.txt" "r"))
)
***********************************************************************************
This is a Common Lisp code defining a function named opn(). Here's what the code does:
The setq function is used to set the variable f to the value returned by the open function, which opens a file named gad.txt located in the D: drive for reading. The "r" argument specifies that the file is opened in read-only mode.
The commented line shows that there is another setq statement that is currently not being used. It opens another file named h.txt located in E:\program files\AutoCAD 2004\ directory for writing. However, the code is currently commented out, which means this line is ignored by the interpreter.
The function definition ends with a closing parenthesis ).
Overall, this code defines a function named opn() that opens an input file named gad.txt for reading and optionally opens an output file named h.txt for writing (the latter is currently commented out).
***********************************************************************************
***********************************************************************************
(defun reed()
(setq scale1 (atof (read-line f)))
(setq scale2 (atof (read-line f)))
(setq skew (atof (read-line f)))
(setq datum (atoi (read-line f)))
(setq toprl (atoi (read-line f)))
(setq left (atof (read-line f)))
(setq right (atof (read-line f)))
(setq xincr (atof (read-line f)))
(setq yincr (atof (read-line f)))
(setq noch (atoi (read-line f)))
(setq hs 1)
(setq vs 1)
(setq vvs (/ 1000.0 vs))
(setq hhs (/ 1000.0 hs))
(setq skew1 (* skew 0.0174532))
(setq s (sin skew1))
(setq c (cos skew1))
(setq tn (/ s c))
(setq sc (/ scale1 scale2))
)
***********************************************************************************
This is a Common Lisp code defining a function named reed(). Here's what the code does:
The setq function is used to set several variables by reading lines from the input file f (which is assumed to have been opened prior to calling this function).
atof is used to convert a string value read from the file to a floating-point number. atoi is used to convert a string value read from the file to an integer.
The variables that are set in this function include:
scale1: The scale factor for the plan and elevation to be plotted on paper.
scale2: The scale factor for the sections to be plotted on paper.
skew: The skew angle (in degrees).
datum: The datum level.
toprl: The top level on the Y axis.
left: The starting chainage of the X axis.
right: The end chainage of the X axis.
xincr: The interval of distances on the X axis (in meters).
yincr: The interval of levels on the Y axis (in meters).
noch: The total number of chainages on the cross-section.
The variables hs and vs are commented out because they are not needed. Instead, hs and vs are set to 1 to indicate that the drawing will be plotted on screen with 1 unit = 1 mm.
vvs and hhs are set to the ratio of 1 meter to 1 millimeter, which is 1000. This is required to convert meters into millimeters as the drawing is plotted with 1 unit = 1 mm.
The sin and cos functions are used to calculate the sine and cosine of the skew angle in radians. The * function is used to multiply the sine value with 0.0174532 to convert the skew angle from degrees to radians.
The tn variable is set to the tangent of the skew angle in radians.
The sc variable is set to the ratio of scale1 to scale2, which is used to adjust the scale of the cross-sections.
The commented lines are used for debugging purposes to print the values of the variables to the output file h.
Overall, this code defines a function named reed() that reads several parameters from an input file and calculates some intermediate variables. These variables are used in subsequent functions to generate plots of cross-sections and other engineering drawings.
***********************************************************************************
***********************************************************************************
(Defun vpos(a)
(setq a (* vvs (- a datum)))
(setq a (+ datum a))
)
(Defun hpos(a)
(setq a (* hhs (- a left)))
(setq a (+ left a))
)
***********************************************************************************
These two subroutines vpos and hpos are used to calculate the vertical and horizontal position of a point in the drawing based on its distance and level from a reference point.
vpos takes the level of a point (a) as input and first calculates the difference between the level of the point and the reference level (datum). It then multiplies this difference by vvs (which is calculated in the previous subroutine reed) to convert the level difference from meters to millimeters, since the drawing uses 1 millimeter as the unit of measurement. Finally, it adds the resulting value to the reference level to get the vertical position of the point.
hpos takes the distance of a point from the left end of the drawing (a) as input and first calculates the difference between the distance of the point and the reference distance (left). It then multiplies this difference by hhs (which is calculated in the previous subroutine reed) to convert the distance difference from meters to millimeters, since the drawing uses 1 millimeter as the unit of measurement. Finally, it adds the resulting value to the reference distance to get the horizontal position of the point.
***********************************************************************************
***********************************************************************************
(Defun v2pos(a)
(setq a (* vvs (- a datum)))
(setq a (* sc a))
(setq a (+ datum a))
)
(Defun h2pos(a)
(setq a (* hhs (- a left)))
(setq a (* sc a))
(setq a (+ left a))
)
***********************************************************************************
These two subroutines v2pos and h2pos are similar to the previous subroutines vpos and hpos, but with an additional calculation to account for the difference in scale between the plan/elevation and the sections.
v2pos takes the level of a point (a) as input and first calculates the difference between the level of the point and the reference level (datum). It then multiplies this difference by vvs (which is calculated in the previous subroutine reed) to convert the level difference from meters to millimeters, since the drawing uses 1 millimeter as the unit of measurement. It then multiplies the resulting value by sc, which is the ratio of the scale of the plan/elevation to the scale of the sections, in order to account for the difference in scale. Finally, it adds the resulting value to the reference level to get the vertical position of the point.
h2pos takes the distance of a point from the left end of the drawing (a) as input and first calculates the difference between the distance of the point and the reference distance (left). It then multiplies this difference by hhs (which is calculated in the previous subroutine reed) to convert the distance difference from meters to millimeters, since the drawing uses 1 millimeter as the unit of measurement. It then multiplies the resulting value by sc, which is the ratio of the scale of the plan/elevation to the scale of the sections, in order to account for the difference in scale. Finally, it adds the resulting value to the reference distance to get the horizontal position of the point.
***********************************************************************************
***********************************************************************************
(defun st()
(command "-style" "Arial" "Arial" "" "" "" "" "")
(command "DIMASZ" "150")
(command "DIMDEC" "0")
(command "DIMEXE" "400")
(command "DIMEXO" "400")
(command "DIMLFAC" "1")
(command "DIMTXSTY" "Arial")
(command "DIMTXT" "400")
(command "DIMTAD" "0")
(command "DIMTIH" "1")
(command "-dimstyle" "save" "pmb100" "y")
)
***********************************************************************************
The given code defines a function called st, which sets the dimension style for AutoCAD. Here is a brief explanation of the commands used:
(command "-style" "Arial" "Arial" "" "" "" "" ""): This sets the current text style to "Arial".
(command "DIMASZ" "150"): This sets the arrow size for the dimensions to 150 drawing units.
(command "DIMDEC" "0"): This sets the number of decimal places to 0 for the dimension text.
(command "DIMEXE" "400"): This sets the size of the dimension line extension to 400 drawing units.
(command "DIMEXO" "400"): This sets the size of the dimension line offset to 400 drawing units.
(command "DIMLFAC" "1"): This sets the overall scale factor for the dimensions to 1.
(command "DIMTXSTY" "Arial"): This sets the text style for the dimension text to "Arial".
(command "DIMTXT" "400"): This sets the height of the dimension text to 400 drawing units.
(command "DIMTAD" "0"): This sets the text alignment for the dimension text to "Center".
(command "DIMTIH" "1"): This turns on the display of the dimension line and extension line on top of the dimension text.
(command "-dimstyle" "save" "pmb100" "y"): This saves the current dimension style with the name "pmb100". The "y" at the end of the command indicates that the function should not prompt the user for confirmation.
Overall, this function is used to set the dimension style for the drawing, so that the dimensions are consistent and have the desired appearance.
***********************************************************************************
***********************************************************************************
(defun layout()
(setq os (getvar "OSMODE"))
(setvar "OSMODE" 0)
(setq left (- left (rem left 1.0)))
(setq pta1 (list left datum))
(setq d1 20)
(setq ptb1 (list left (- datum (* d1 scale1))))
(setq pta2 (list (hpos right) datum))
(setq ptb2 (list (hpos right) (- datum (* d1 scale1))))
(setq ptc1 (list left (- datum (* d1 scale1 2))))
(setq ptc2 (list (hpos right) (- datum (* d1 scale1 2))))
(setq ptd1 (list left (vpos toprl)))
(COMMAND "line" pta1 pta2 "")
(COMMAND "line" ptb1 ptb2 "")
(COMMAND "line" ptc1 ptc2 "")
(COMMAND "line" ptc1 ptd1 "")
(setq ptb3 (list (- left (* 25 scale1)) (- datum (* d1 0.5 scale1))))
(command "text" ptb3 (* 2.5 scale1) 0 (princ "BED LEVEL"))
(setq ptb3 (list (- left (* 25 scale1)) (- datum (* d1 1.5 scale1))))
(command "text" ptb3 (* 2.5 scale1) 0 (princ "CHAINAGE"))
(setq d2 2.5)
(setq pta1 (list (- left (* d2 scale1)) datum))
(setq pta2 (list (+ left (* d2 scale1)) datum ))
(command "color" 7)
(command  "line" pta1 pta2 "")
(setq e1 (entlast))
(setq nov (- toprl datum))
(setq nov (fix nov))
(Command "array" e1  "" "R"  (+ nov 1) 1 vvs)
(setq a 0)
(setq n (/ nov yincr))
(setq n (fix n))
(while (< a (+ n 1))
(setq lvl (+ datum (* a yincr)))
(setq b1 (rtos lvl 2 3))
(setq pta1 (list (- left (* 13 scale1)) (- (vpos lvl) (* 1.0 scale1))))
(command "text" pta1 (* 2.0 scale1) 0 (princ b1))
(setq a (+ a 1))
)
(setq a 1)
(setq noh (- right left))
(setq n (/ noh xincr))
(setq n (fix n))
(while (< a (+ n 1))
(setq ch (+ left (* a xincr)))
(setq b1 (rtos ch 2 3))
(setq d4 (* 2 d1))
(setq d5 (- d4 2.0))
(setq d6 (+ d1 2.0))
(setq d7 (- d1 2.0))
(setq d8 (- d4 4.0))
(setq d9 (- d1 4.0))
(setq pta1 (list (+ scale1 (hpos ch)) (- datum (* d8 scale1))))
(command "text" pta1 (* 2.0 scale1) 90 (princ b1))
(setq pta1 (list (hpos ch) (- datum (* d4 scale1))))
(setq pta2 (list (hpos ch) (- datum (* d5 scale1))))
(setq pta3 (list (hpos ch) (- datum (* d6 scale1))))
(setq pta4 (list (hpos ch) (- datum (* d7 scale1))))
(command "color" 7)
(command  "line" pta1 pta2 "")
(command "line" pta3 pta4 "")
(setq a (+ a 1))
)
)
***********************************************************************************
The code defines a function called layout(), which seems to create a plotting layout for displaying elevation data. The function starts by saving the current OSMODE setting, then turning off object snap (OSNAP) mode. It then calculates the position of several points and draws lines to create the X and Y axes of the plotting layout.
The X axis is drawn using two points, pta1 and pta2, which are calculated based on the left and right variables, and the datum, scale1, and d1 constants. The left and right variables seem to represent the left and right edges of the plotting area. The datum variable appears to be the elevation datum or reference level, while scale1 is a scaling factor, and d1 represents the distance between lines parallel to the X axis. The pta1 and pta2 points are used to draw a line using the AutoCAD line command.
The function then proceeds to draw three more lines parallel to the X axis at distances of d1*scale1, d1*scale1*2, and -datum. The Y axis is drawn by drawing a line from the origin at ptc1 to the top of the plotting area at ptd1. The function also adds text labels for "BED LEVEL" and "CHAINAGE" at specific points on the X axis.
The function then calculates the positions of small lines to be drawn on the Y axis and creates them using the line command. These small lines are then arrayed along the Y axis using the array command. The function then enters a while loop to write elevation levels on the Y axis. The number of levels to write is determined by dividing the difference between the top and bottom of the plotting area by the elevation increment yincr. The elevation levels are written using the text command at positions calculated using the vpos and scale1 variables.
The function then enters another while loop to write chainage values on the X axis. The number of chainage values to write is determined by dividing the length of the plotting area by the chainage increment xincr. The chainage values are written using the text command at positions calculated using the left, d4, and scale1 variables. Small lines are also drawn on the X axis at positions determined by the d5, d6, and d7 variables. The d8 and d9 variables determine the positions at which the chainage and RL (reduced level) values are written, respectively.
Overall, this code seems to be creating a plotting layout for displaying elevation data in AutoCAD, complete with axis labels and gridlines.
***********************************************************************************
***********************************************************************************
(defun cs()
(setq a 1)
(while (< a  (+ noch 1))
(setq x (atof (read-line f)))
(setq y (atof (read-line f)))
(setq b1 (rtos x 2 3))
(setq b2 (rtos y 2 3))
(setq xx (hpos x))
(setq pta1 (list (+ xx (* 0.9 scale1)) (- datum (* d8 scale1))))
(setq pta2 (list (+ xx (* 0.9 scale1)) (- datum (* d9 scale1))))
(command "text" pta2 (* 2 scale1) 90 (princ b2))
(setq b (rem (- x left) xincr))
(if (/= b 0.0)(command "text" pta1 (* 1.8 scale1) 90 (princ b1)))
(setq pta1 (list xx (- datum (* d4 scale1))))
(setq pta2 (list xx (- datum (* d5 scale1))))
(setq pta3 (list xx (- datum (* d6 scale1))))
(setq pta4 (list xx (- datum (* d7 scale1))))
(if (/= b 0.0)(command  "line" pta1 pta2 ""))
(if (/= b 0.0)(command "line" pta3 pta4 ""))
(setq pta5 (list xx (- datum (* 2 scale1))))
(setq pta6 (list xx datum))
(command  "line" pta5 pta6 "")
(setq ptb4 (list xx (vpos y)))
(if (/= a 1) (command "line" ptb3 ptb4 ""))
(setq ptb3 ptb4)
(setq a (+ a 1))
)
)
***********************************************************************************
This code defines a function called "cs" that plots a cross-section of a river and writes the chainages (distances along the river) on the X-axis. The function reads input data from a file "f". Here is a step-by-step explanation of the code:
(defun cs() ...) - This line defines a new function called "cs" that takes no arguments.
(setq a 1) - This line sets a variable "a" to 1. This variable is used to keep track of the current chainage.
(while (< a (+ noch 1)) ...) - This starts a while loop that continues until the current chainage ("a") is greater than the total number of chainages ("noch").
(setq x (atof (read-line f))) - This line reads the next line of input from the file "f" and converts it to a floating-point number. This value represents the current chainage.
(setq y (atof (read-line f))) - This line reads the next line of input from the file "f" and converts it to a floating-point number. This value represents the river level at the current chainage.
(setq b1 (rtos x 2 3)) - This line converts the current chainage ("x") to a string with two digits before the decimal point and three digits after the decimal point.
(setq b2 (rtos y 2 3)) - This line converts the river level ("y") to a string with two digits before the decimal point and three digits after the decimal point.
(setq xx (hpos x)) - This line calculates the X-coordinate on the plot where the current chainage should be written.
(setq pta1 (list (+ xx (* 0.9 scale1)) (- datum (* d8 scale1)))) - This line sets the coordinates where the current chainage should be written. The Y-coordinate is determined by subtracting the datum (a constant value) from 2 times "scale1". The X-coordinate is calculated as the sum of "xx" and 0.9 times "scale1".
(setq pta2 (list (+ xx (* 0.9 scale1)) (- datum (* d9 scale1)))) - This line sets the coordinates where the river level should be written. The Y-coordinate is determined by subtracting the datum (a constant value) from "scale1". The X-coordinate is calculated as the sum of "xx" and 0.9 times "scale1".
(command "text" pta2 (* 2 scale1) 90 (princ b2)) - This line writes the river level on the plot using the "text" command. The text is written at the coordinates specified by "pta2". The height of the text is set to twice "scale1". The text is rotated 90 degrees. The "princ" function prints the river level to the command line.
(setq b (rem (- x left) xincr)) - This line calculates the remainder when the difference between the current chainage ("x") and the left boundary ("left") is divided by the chainage increment ("xincr").
(if (/= b 0.0)(command "text" pta1 (* 1.8 scale1) 90 (princ b1))) - This line writes the current chainage on the plot using the "text" command, but only if the remainder calculated in step 12 is not equal to 0. The text is written at the coordinates specified by "pta1
***********************************************************************************
***********************************************************************************
(defun pier()
(setq nspan (atoi (read-line f)))
(setq lbridge (atof (read-line f)))
(setq abtl (atof (read-line f)))
(setq RTL (atof (read-line f)))
(setq rtl2 (- RTL (* 30 sc)))
(setq Sofl (atof (read-line f)))
(setq kerbw (atof (read-line f)))
(setq kerbd (atof (read-line f)))
(setq ccbr (atof (read-line f)))
(setq slbthc (atof (read-line f)))
(setq slbthe (atof (read-line f)))
(setq slbtht (atof (read-line f)))
(setq capt (atof (read-line f)))
(setq capb (atof (read-line f)))
(setq capw (atof (read-line f)))
(setq piertw (atof (read-line f)))
(setq battr (atof (read-line f)))
(setq pierst (atof (read-line f)))
(setq piern (atoi (read-line f)))
(setq spans abtl)
(setq a 1)
(while (<= a nspan)
(setq span1 (atof (read-line f)))
(setq futrl (atof (read-line f)))
(setq futd (atof (read-line f)))
(setq futw (atof (read-line f)))
(setq futl (atof (read-line f)))
(setq spane (+ spans span1))
(setq x1 (hpos spans))
(setq y1 (vpos RTL))
(setq x2 (hpos spane))
(setq y2 (vpos sofl))
(setq pta1 (list (+ x1 25.0) y1))
(setq pta2 (list (- x2 25.0) y2))
(command "rectangle" pta1 pta2)
(setq pta1 (list x1 y1))
(setq pta2 (list x2 y1))
(setq ptaa1 (list (+ x1 50) (+ y1 2000)))
(command "DIMLINEAR" pta1 pta2 ptaa1)
(setq x1 spane)
(setq capwsq (/ capw c))
(setq x1 (- x1 (/ capwsq 2)))
(setq x2 (+ x1 capwsq))
(setq x1 (hpos x1))
(setq x2 (hpos x2))
(setq y1 (vpos capt))
(setq y2 (vpos capb))
(setq pta1 (list x1 y1))
(setq pta2 (list x2 y2))
(command "rectangle" pta1 pta2)
(setq ptaa1 (list (+ x1 50) (- y2 400)))
(command "DIMEXE" "300")
(command "DIMEXO" "200")
(command "DIMLINEAR" (list x1 y2) pta2 ptaa1)
(setq xc spane)
(setq piertwsq (/ piertw c))
(setq x1 (- xc (/ piertwsq 2)))
(setq x3 (+ x1 piertwsq))
(setq y2 (+ futrl futd))
(setq ofset (/ (- capb y2) battr))
(setq ofsetsq (/ ofset c))
(setq x2 (- x1 ofsetsq))
(setq x4 (+ x3 ofsetsq))
(setq y4 y2)
(setq pta1 (pt x1 capb pta1))
(setq pta2 (pt x2 y2 pta2))
(setq pta3 (pt x3 capb pta3))
(setq pta4 (pt x4 y4 pta4))
(command "line" pta1 pta2 "")
(command "line" pta3 pta4 "")
(setq ptaa1 (list (+ (hpos x2) 50) (- (vpos y2) 300)))
(command "DIMEXE" "200")
(command "DIMEXO" "100")
(command "DIMLINEAR" pta2 pta4 ptaa1)
(setq futwsq (/ futw c))
(setq x5 (- xc (/ futwsq 2)))
(setq x6 (+ x5 futwsq))
(setq y6 futrl)
(setq y5 y4)
(setq pta5 (pt x5 y5 pta5))
(setq pta6 (pt x6 y6 pta6))
(command "rectangle" pta5 pta6)
(setq pt1 (list (hpos x5) (vpos y6)))
(setq pt2 pta6)
(setq pt3 (list (+ (hpos x5) 100) (- (vpos y6) 600)))
(command "DIMEXE" "200")
(command "DIMEXO" "400")
(command "DIMLINEAR" pt1 pt2 pt3)
(setq pt2 pt1)
(setq pt1 pta5)
(setq pt3 (list (- (hpos x5) 700) (- (vpos y5) 100)))
(command "DIMEXE" "400")
(command "DIMEXO" "500")
(command "DIMLINEAR" pt1 pt2 pt3)
(setq x7 (- xc (/ futw 2)))
(setq x8 (+ x7 futw))
(setq yc (- datum 30.0))
(setq y7 (+ yc (/ futl 2)))
(setq y8 (- y7 futl))
(setq pta7 (pt x7 y7 pta7))
(setq pta8 (pt x8 y8 pta8))
(command "rectangle" pta7 pta8)
(setq g2 (entlast))
(setq pt1 (list (hpos x7) (vpos y8)))
(setq pt2 pta8)
(setq pt3 (list (+ (hpos x7) 100) (- (vpos y8) 600)))
(command "DIMEXE" "200")
(command "DIMEXO" "400")
(command "DIMLINEAR" pt1 pt2 pt3)
(setq g3 (entlast))
(setq pt1 (list (hpos x8) (vpos y7)))
(setq pt2 pta8)
(setq pt3 (list (+ (hpos x8) 700) (- (vpos y7) 100)))
(command "DIMEXE" "200")
(command "DIMEXO" "500")
(command "DIMLINEAR" pt1 pt2 pt3)
(setq g4 (entlast))
(setq ptc (pt xc yc ptc))
(Command "rotate" g2 g3 g4 "" ptc skew)
(setq pierstsq (+ (/ pierst c) (abs (* piertw tn))))
(setq x1 (- xc (/ piertw 2)))
(setq x3 (+ x1 piertw))
(setq x2 (- x1 ofset))
(setq x4 (+ x3 ofset))
(setq y9 (+ yc (/ pierstsq 2)))
(setq y10 (- y9 pierstsq))
(setq pta9 (pt x2 y9 pta9))
(setq pta10 (pt x2 y10 pta10))
(setq pta11 (pt x1 y9 pta11))
(setq pta12 (pt x1 y10 pta12))
(setq pta13 (pt x3 y9 pta13))
(setq pta14 (pt x3 y10 pta14))
(setq pta15 (pt x4 y9 pta15))
(setq pta16 (pt x4 y10 pta16))
(command "line" pta9 pta10 "")
(setq g1(entlast))
(command "line" pta11 pta12 "")
(setq g2(entlast))
(command "line" pta13 pta14 "")
(setq g3(entlast))
(command "line" pta15 pta16 "")
(setq g4(entlast))
(setq y17 (+ y9 (/ piertw 2)))
(setq y18 (+ y17 ofset))
(setq y19 (- y10 (/ piertw 2)))
(setq y20 (- y19 ofset))
(setq pta17 (pt xc y17 pta17))
(setq pta18 (pt xc y18 pta18))
(setq pta19 (pt xc y19 pta19))
(setq pta20 (pt xc y20 pta20))
(command "arc" pta9 pta18 pta15)
(setq g5(entlast))
(command "arc" pta11 pta17 pta13)
(setq g6(entlast))
(command "arc" pta12 pta19 pta14)
(setq g7(entlast))
(command "arc" pta10 pta20 pta16)
(setq g8(entlast))
(command "DIMEXE" "200")
(command "DIMEXO" "500")
(setq pt3 (list (+ (hpos x4) 700) (- (vpos y9) 100)))
(command "DIMLINEAR" pta15 pta16 pt3)
(setq g9 (entlast))
(setq pt3 (list (+ (hpos x1) 100) (+ (vpos y9) 700)))
(command "DIMLINEAR" pta11 pta13 pt3)
(setq g10 (entlast))
(setq pt3 (list (+ (hpos x2) 100) (+ (vpos y9) 1000)))
(command "DIMLINEAR" pta9 pta15 pt3)
(setq g11 (entlast))
(Command "rotate" g1 g2 g3 g4 g5 g6 g7 g8 g9 g10 g11 "" ptc skew)
(setq n a)
(while (= n piern)
(setq futprl futrl)
(setq futpd futd)
(setq futpw futw)
(setq futpl futl)                 : read length of footing  along current direction.
(setq n (+ n 1))
)
(setq a (+ 1 a))
(setq spans spane)
)
(setq x1 (hpos spane))
(setq y1 (vpos RTL))
(setq x2 (hpos (+ abtl lbridge)))
(setq y2 (vpos sofl))
(setq pta1 (list (+ x1 25.0) y1))
(setq pta2 (list (- x2 25.0) y2))
(command "rectangle" pta1 pta2)
(setq pta1 (list x1 y1))
(setq pta2 (list x2 y1))
(setq ptaa1 (list (+ x1 50) (+ y1 2000)))
(command "DIMLINEAR" pta1 pta2 ptaa1)
(setq xp (+ left 55))
(setq yp rtl2)
(setq ppt16 (p2t xp yp ppt16))
(setq ccbrsq (/ ccbr c))
(setq ppt1 (p2t (+ xp (/ ccbrsq 2)) yp ppt1))
(setq ppt2 (p2t (+ xp ccbrsq) yp ppt2))
(setq kerbwsq (/ kerbw c))
(setq ppt3 (p2t (+ xp ccbrsq kerbwsq) (+ yp (- slbthe slbtht)) ppt3))
(setq ppt4 (p2t (+ xp ccbrsq kerbwsq) (+ yp slbthe) ppt4))
(setq ppt5 (p2t (+ xp ccbrsq kerbwsq) (+ yp slbthe kerbd) ppt5))
(setq k1(/ 0.05 c))
(setq k2(/ 0.025 c))
(setq ppt6 (p2t (+ xp ccbrsq k1) (+ yp slbthe kerbd) ppt6))
(setq ppt7 (p2t (+ xp ccbrsq k2) (+ yp slbthe kerbd (- 0 0.025)) ppt7))
(setq ppt8 (p2t (+ xp ccbrsq) (+ yp slbthe) ppt8))
(setq ppt9 (p2t (+ xp (/ ccbrsq 2)) (+ yp slbthc) ppt9))
(setq ppt10 (p2t xp (+ yp slbthe) ppt10))
(setq ppt11 (p2t (- xp k2) (+ yp slbthe kerbd (- 0 0.025)) ppt11))
(setq ppt12 (p2t (- xp k1) (+ yp slbthe kerbd) ppt12))
(setq ppt13 (p2t (- xp kerbwsq) (+ yp slbthe kerbd) ppt13))
(setq ppt14 (list (car ppt13) (cadr ppt4)))
(setq ppt15 (list (car ppt13) (cadr ppt3)))
(command "line" ppt16 ppt1 ppt2 ppt3 ppt4 ppt5 ppt6 ppt7 ppt8 ppt9 ppt10 ppt11 ppt12 ppt13 ppt14 ppt15 ppt16 "")
(command "line" ppt14 ppt10 "")
(command "line" ppt8 ppt4 "")
(setq diff (- pierstsq ccbrsq))
(setq diff (/ diff 2))
(setq xp (- xp diff))
(setq pedstl (- sofl capt))
(setq yp (- yp pedstl))
(setq ppt16 (p2t xp yp ppt16))
(setq capd (- capt capb))
(setq ppt17 (p2t (- xp (/ capw 2)) yp ppt17))
(setq ppt18 (p2t (+ xp pierstsq (/ capw 2)) yp ppt18))
(setq ppt19 (p2t (- xp (/ capw 2)) (- yp capd) ppt19))
(setq ppt20 (p2t (+ xp pierstsq (/ capw 2)) (- yp capd) ppt20))
(command "line" ppt17 ppt18 ppt20 ppt19 ppt17 "")
(setq ppt21 (p2t (- xp (/ piertw 2)) (- yp capd) ppt21))
(setq ppt22 (p2t xp (- yp capd) ppt22))
(setq ppt23 (p2t (+ xp pierstsq) (- yp capd) ppt23))
(setq ppt24 (p2t (+ xp pierstsq (/ piertw 2)) (- yp capd) ppt24))
(setq xpc (+ xp (/ pierstsq 2)))
(setq pierht (- capb futprl futpd))
(setq pierbw  (/ pierht battr))
(setq pierbw (+ pierbw  pierbw piertw))
(setq h1 (- yp pierht capd))
(setq ppt25 (p2t (- xpc (/ futpl 2)) h1 ppt25))
(setq ppt26 (p2t (- xp (/ pierbw 2)) h1 ppt26))
(setq ppt27 (p2t xp h1 ppt27))
(setq ppt28 (p2t (+ xp pierstsq) h1 ppt28))
(setq ppt29 (p2t (+ xp pierstsq (/ pierbw 2)) h1 ppt29))
(setq ppt30 (p2t (+ xpc (/ futpl 2)) h1 ppt30))
(setq h2 (- h1 futpd))
(setq ppt31 (p2t (- xpc (/ futpl 2)) h2 ppt31))
(setq ppt32 (p2t  xpc  h2 ppt32))
(setq ppt33 (p2t (+ xpc (/ futpl 2)) h2 ppt33))
(setq ppt2 (p2t (+ xp ccbrsq diff diff) yp ppt2))
slab at bottom.
(command "line" ppt21 ppt26 "")
(command "line" ppt16 ppt27 "")
(command "line" ppt2 ppt28 "")
(command "line" ppt24 ppt29 "")
(command "line" ppt25 ppt30 ppt33 ppt31 ppt25 "")
(command "line" ppt9  ppt32 "")
)
***********************************************************************************
This is Lisp code for plotting a pier in elevation, plan, and side view. The code is divided into sections that perform various tasks. Here is a brief description of what each section does:
Section 5.1: Reads input data from a file. The file is assumed to contain the following data (in order):
Number of spans
Length of bridge
Chainage of left abutment
RL of top of right abutment
Soffit level
Width of kerb at deck top
Depth of kerb above deck top
Clear carriageway width of bridge
Thickness of slab at center
Thickness of slab at edge (considering camber of 2.5%)
Thickness of slab at tip (generally 0.150)
RL of pier cap top
RL of pier cap bottom (equals pier top)
Width of pier cap
Width of pier top
Pier batter
Straight length of pier
Serial number of pier which will be shown in cross-section YY (generally the deepest pier)
Section 5.2: Starts a while loop that reads and draws piers. The loop runs nspan times, where nspan is the number of spans specified in the input file. For each span, the following data is read from the file (in order):
Span individual length
Founding RL of pier foundation
Depth of pier foundation
Width of rectangular pier foundation
Length of pier foundation along the current direction.
Section 5.3: Draws a section through the bridge in elevation. It starts by calculating the chainage of the current span (spans) and the end chainage of the current span (spane) by adding the individual span length (span1) to the starting chainage of the span (spans). It then uses these values to draw the section in elevation. The section is represented by a rectangle.
Section 5.4: Draws a plan view of the bridge. This section is not implemented in the code.
Section 5.5: Draws a side view of the pier. It starts by calculating the RL of the bottom of the pier foundation (foundrl) by subtracting the depth of the pier foundation (futd) from the founding RL of the pier foundation (futrl). It then calculates the RL of the top of the pier (piertoprl) by adding the pier cap top RL (capt) to the thickness of the pier cap (capw). It calculates the width of the pier foundation at the bottom (futwb) by adding twice the width of the pier foundation (futw) to twice the thickness of the slab at the edge (slbthe). It calculates the width of the pier foundation at the top (piertopw) by adding twice the width of the pier top (piertw) to twice the thickness of the slab at the edge (slbthe). It then uses these values to draw the side view of the pier, which consists of a rectangle for the pier foundation and a trapezoid for the pier top.
***********************************************************************************
***********************************************************************************
(defun pt(a b z)
(setq aa a)
(setq aa (hpos aa))
(setq bb b)
(setq bb (vpos bb))
(setq z (list aa bb))
)
***********************************************************************************
The given code defines a function called "pt" which takes in three arguments "a", "b", and "z". The purpose of this function is to convert a given point into a point on a graph and return it as a list.
The function starts by setting the variable "aa" equal to the value of "a", then it calls the function "hpos" with the value of "aa" and sets "aa" to the result of this function. The function "hpos" is not defined in the given code snippet, so it is likely defined elsewhere in the program.
Next, the function sets the variable "bb" equal to the value of "b", then it calls the function "vpos" with the value of "bb" and sets "bb" to the result of this function. Again, the function "vpos" is not defined in the given code snippet.
Finally, the function sets the value of "z" to a list containing the values of "aa" and "bb". The updated value of "z" is then returned by the function.
The last line of code shown is not part of the "pt" function definition but is likely calling the "pt" function with the values of "nn1" and "pta1" and setting the variable "pta1" to the result.
***********************************************************************************
***********************************************************************************
(defun p2t(a b z)
(setq aa a)
(setq aa (h2pos aa))
(setq bb b)
(setq bb (v2pos bb))
(setq z (list aa bb))
)
***********************************************************************************
The given code defines a function named "p2t" using the "defun" keyword. This function takes three arguments, namely "a", "b", and "z". The purpose of this function is to convert a given point (a,b) into a point on a graph, and store the result in the variable "z".
Let's take a look at each line of the function:
(setq aa a)
This line sets the value of a local variable named "aa" to the value of the argument "a". This is done so that the original value of "a" is not modified.
(setq aa (h2pos aa))
This line sets the value of "aa" to the result of calling the function "h2pos" with the argument "aa". The "h2pos" function is assumed to be defined elsewhere in the program. It likely takes a value in some unit of horizontal distance and returns a corresponding value on the horizontal axis of the graph.
(setq bb b)
This line sets the value of a local variable named "bb" to the value of the argument "b". This is done so that the original value of "b" is not modified.
(setq bb (v2pos bb))
This line sets the value of "bb" to the result of calling the function "v2pos" with the argument "bb". The "v2pos" function is assumed to be defined elsewhere in the program. It likely takes a value in some unit of vertical distance and returns a corresponding value on the vertical axis of the graph.
(setq z (list aa bb))
This line creates a list with the values of "aa" and "bb" and assigns it to the variable "z". This list represents the point (aa,bb) on the graph.
Finally, the function is closed with a closing parenthesis, and the next line of code is not part of the function.
***********************************************************************************
***********************************************************************************
(defun abt1()
(setq dwth (atof (read-line f)))
(setq alcw (atof (read-line f)))
(setq alcd (atof (read-line f)))
(setq alfb (atof (read-line f)))
(setq alfbl (atof (read-line f)))
(setq altb (atof (read-line f)))
(setq altbl (atof (read-line f)))
(setq alfo (atof (read-line f)))
(setq alfd (atof (read-line f)))
(setq albb (atof (read-line f)))
(setq albbl (atof (read-line f)))
(setq abtlen (+ ccbrsq kerbwsq kerbwsq))
(setq x1 abtl)
(setq alcwsq (/ alcw 1))
(setq x3 (+ x1 alcwsq))
(setq capb (- capt alcd))
(setq p1 (/ (- capb alfbl) alfb))
(setq p1sq (/ p1 1))
(setq x5 (+ x3 p1sq))
(setq p2 (/ (- alfbl altbl) altb))
(setq p2sq (/ p2 1))
(setq x6 (+ x5 p2sq))
(setq alfosq (/ alfo 1))
(setq x7 (+ x6 alfosq))
(setq y8 (- altbl alfd))
(setq dwthsq (/ dwth 1))
(setq x14 (- x1  dwthsq))
(setq p3 (/ (- capb albbl) albb))
(setq p3sq (/ p3 1))
(setq x12 (- x14 p3sq))
(setq rt1s x12)
(setq x10 (- x12 alfosq))
(setq pt1 (pt x1 rtl pt1))
(setq pt2 (pt x1 capt pt2))
(setq pt3 (pt x3 capt pt3))
(setq pt4 (pt x3 capb pt4))
(setq pt5 (pt x5 alfbl pt5))
(setq pt6 (pt x6 altbl pt6))
(setq pt7 (pt x7 altbl pt7))
(setq pt8 (pt x7 y8 pt8))
(setq pt9 (pt x10 y8 pt9))
(setq pt10 (pt x10 altbl pt10))
(setq pt11 (pt x12 altbl pt11))
(setq pt12 (pt x12 albbl pt12))
(setq pt13 (pt x14 capb pt13))
(setq pt14 (pt x14 rtl pt14))
(setq pt15 (pt x12 rtl pt15))
(command "line" pt1 pt2 pt3 pt4 pt5 pt6 pt7 pt8 pt9 pt10 pt11 pt12 pt13 pt14 pt1 "")
(command "line" pt13 pt4 "")
(command "line" pt10 pt7 "")
(command "line" pt12 pt15 pt14 "")
***********************************************************************************
This Lisp code generates various points on the elevation of an abutment and then creates lines connecting these points to draw the abutment.
The (pt x y z) function is used to create a point object with the given x, y, and z coordinates. The setq function is used to assign a value to a variable.
Here is a breakdown of the code:
(setq pt1 (pt x1 rtl pt1)): This line creates a point object pt1 with x-coordinate x1, y-coordinate rtl, and z-coordinate pt1. rtl and pt1 are assumed to be previously defined variables. This point is used to draw the first line of the abutment.
(setq pt2 (pt x1 capt pt2)): This line creates a point object pt2 with x-coordinate x1, y-coordinate capt, and z-coordinate pt2. capt and pt2 are assumed to be previously defined variables. This point is used to draw the second line of the abutment.
(setq pt3 (pt x3 capt pt3)): This line creates a point object pt3 with x-coordinate x3, y-coordinate capt, and z-coordinate pt3. capt and pt3 are assumed to be previously defined variables. This point is used to draw the third line of the abutment.
(setq pt4 (pt x3 capb pt4)): This line creates a point object pt4 with x-coordinate x3, y-coordinate capb, and z-coordinate pt4. capb and pt4 are assumed to be previously defined variables. This point is used to draw the fourth line of the abutment.
(setq pt5 (pt x5 alfbl pt5)): This line creates a point object pt5 with x-coordinate x5, y-coordinate alfbl, and z-coordinate pt5. alfbl and pt5 are assumed to be previously defined variables. This point is used to draw the fifth line of the abutment.
(setq pt6 (pt x6 altbl pt6)): This line creates a point object pt6 with x-coordinate x6, y-coordinate altbl, and z-coordinate pt6. altbl and pt6 are assumed to be previously defined variables. This point is used to draw the sixth line of the abutment.
(setq pt7 (pt x7 altbl pt7)): This line creates a point object pt7 with x-coordinate x7, y-coordinate altbl, and z-coordinate pt7. altbl and pt7 are assumed to be previously defined variables. This point is used to draw the seventh line of the abutment.
(setq pt8 (pt x7 y8 pt8)): This line creates a point object pt8 with x-coordinate x7, y-coordinate y8, and z-coordinate pt8. y8 and pt8 are assumed to be previously defined variables. This point is used to draw the eighth line of the abutment.
(setq pt9 (pt x10 y8 pt9)): This line creates a point object pt9 with x-coordinate x10, y-coordinate y8, and z-coordinate pt9. y8 and pt9 are assumed to be previously defined variables. This point is used to draw the ninth line of the abutment.
The line (setq pt10 (pt x10 altbl pt10)) calculates the point pt10 as the point obtained by calling the pt function with parameters x10, altbl, and pt10. The pt function is used to create a new point object at the specified coordinates.
The next line calculates the point pt11 as the point obtained by calling the pt function with parameters x12, altbl, and pt11.
The next line calculates the point pt12 as the point obtained by calling the pt function with parameters x12, albbl, and pt12.
The next line calculates the point pt13 as the point obtained by calling the pt function with parameters x14, capb, and pt13.
The next line calculates the point pt14 as the point obtained by calling the pt function with parameters x14, rtl, and pt14.
The next line calculates the point pt15 as the point obtained by calling the pt function with parameters x12, rtl, and pt15.
The next four lines use AutoCAD's command function to draw lines between the points calculated above. The first line draws a line that passes through all the points starting with pt1 and ending with pt14, and then returns to pt1.
The second line draws a line between pt13 and pt4.
The third line draws a line between pt10 and pt7.
The fourth line draws a line that connects pt12, pt15, and pt14.
Overall, this Lisp code is likely part of a larger program that creates a specific set of lines and shapes in an AutoCAD drawing.
***********************************************************************************
***********************************************************************************
(setq y20 (+ yc (/ abtlen 2)))
(setq y21 (- y20 abtlen))
(setq y16 (+ y20 0.15))
(setq y17 (- y21 0.15))
(setq footl (- y16 y17))
(setq footl (/ footl 2))
(setq x (* footl s))
(setq y (* footl (- 1 c)))
(setq pt16 (pt (- x10 x) (- y16 y) pt16))
(setq pt17 (pt (+ x10 x) (+ y17 y) pt17))
(setq pt18 (pt (- x7 x) (- y16 y) pt18))
(setq pt19 (pt (+ x7 x) (+ y17 y) pt19))
(setq pt14 (pt x14 rtl pta14))
(setq pt15 (pt x12 rtl pta15))
(command "line" pt16 pt17 pt19 pt18 pt16 "")
(setq xx (/ abtlen 2))
(setq x (* xx s))
(setq y (* xx (- 1 c)))
(setq y20 (- y20 y))
(setq y21 (+ y21 y))
(setq pt20 (pt (- x12 x) y20 pt20))
(setq pt21 (pt (+ x12 x) y21 pt21))
(setq pt22 (pt (- x14 x) y20 pt22))
(setq pt23 (pt (+ x14 x) y21 pt23))
(setq pt24 (pt (- x1 x) y20 pt24))
(setq pt25 (pt (+ x1 x) y21 pt25))
(setq pt26 (pt (- x3 x) y20 pt26))
(setq pt27 (pt (+ x3 x) y21 pt27))
(setq pt28 (pt (- x5 x) y20 pt28))
(setq pt29 (pt (+ x5 x) y21 pt29))
(setq pt30 (pt (- x6 x) y20 pt30))
(setq pt31 (pt (+ x6 x) y21 pt31))
(command "line" pt20 pt21 "")
(command "line" pt22 pt23 "")
(command "line" pt24 pt25 "")
(command "line" pt26 pt27 "")
(command "line" pt28 pt29 "")
(command "line" pt30 pt31 "")
(command "line" pt21 pt31 "")
(command "line" pt20 pt30 "")
***********************************************************************************
The given code is a LISP code that defines a function called abt1. This function is a part of a larger program that seems to be related to the design and analysis of an
abutment structure. Let's analyze the code step by step:
(defun abt1()
This line defines the function abt1.
(setq dwth (atof (read-line f)))
(setq alcw (atof (read-line f)))
(setq alcd (atof (read-line f)))
(setq alfb (atof (read-line f)))
(setq alfbl (atof (read-line f)))
(setq altb (atof (read-line f)))
(setq altbl (atof (read-line f)))
(setq alfo (atof (read-line f)))
(setq alfd (atof (read-line f)))
(setq albb (atof (read-line f)))
(setq albbl (atof (read-line f)))
These lines read in several input values from a file. These input values are related to various dimensions of the abutment structure. For example, dwth denotes the
thickness of the dirt wall, alcw denotes the width of the abutment left cap (excluding dirt wall), altb denotes the toe batter of the abutment left, etc.
(setq abtlen (+ ccbrsq kerbwsq kerbwsq))
This line calculates the length of the abutment. The value of abtlen is calculated as the sum of ccbrsq, kerbwsq, and kerbwsq.
(setq x1 abtl)
(setq alcwsq (/ alcw 1))
(setq x3 (+ x1 alcwsq))
(setq capb (- capt alcd))
(setq p1 (/ (- capb alfbl) alfb))
(setq p1sq (/ p1 1))
(setq x5 (+ x3 p1sq))
(setq p2 (/ (- alfbl altbl) altb))
(setq p2sq (/ p2 1))
(setq x6 (+ x5 p2sq))
(setq alfosq (/ alfo 1))
(setq x7 (+ x6 alfosq))
(setq y8 (- altbl alfd))
(setq dwthsq (/ dwth 1))
(setq x14 (- x1  dwthsq))
(setq p3 (/ (- capb albbl) albb))
(setq p3sq (/ p3 1))
(setq x12 (- x14 p3sq))
(setq rt1s x12)
(setq x10 (- x12 alfosq))
These lines calculate various coordinates that are needed to draw the elevation of the abutment structure. The calculations involve several input parameters and
some basic arithmetic operations.
(setq pt1 (pt x1 rtl pt1))
(setq pt2 (pt x1 capt pt2))
(setq pt3 (pt x3 capt pt3))
(setq pt4 (pt x3 capb pt4))
(setq pt5 (pt x5 alfbl pt5))
(setq pt6 (pt x6 altbl pt6))
(setq pt7 (pt x7 altbl pt7))
(setq pt8 (pt x7 y8 pt8))
(setq pt9 (pt x10 y8 pt9))
(setq pt10 (pt x10 altbl pt10))
(setq pt11 (pt x12 altbl pt11))
(setq pt12 (pt x12 albbl pt12))
(setq pt13 (pt x14 capb pt13))
(setq pt14 (pt x14 rtl pt14))
(setq pt15 (pt x12 rtl pt15))
(command "line" pt1 pt2 pt3 pt4 pt5 pt6 pt7 pt8 pt9 pt10 pt11 pt12 pt13 pt14 pt1 "")
(command "line" pt13 pt4 "")
(command "line" pt10 pt7 "")
(command "line" pt12 pt15 pt14 "")
(setq y20 (+ yc (/ abtlen 2)))
(setq y21 (- y20 abtlen))
(setq y16 (+ y20 0.15))
(setq y17 (- y21 0.15))
(setq footl (- y16 y17))
(setq footl (/ footl 2))
(setq x (* footl s))
(setq y (* footl (- 1 c)))
(setq pt16 (pt (- x10 x) (- y16 y) pt16))
(setq pt17 (pt (+ x10 x) (+ y17 y) pt17))
(setq pt18 (pt (- x7 x) (- y16 y) pt18))
(setq pt19 (pt (+ x7 x) (+ y17 y) pt19))
(setq pt14 (pt x14 rtl pta14))
(setq pt15 (pt x12 rtl pta15))
(command "line" pt16 pt17 pt19 pt18 pt16 "")
(setq xx (/ abtlen 2))
(setq x (* xx s))
(setq y (* xx (- 1 c)))
(setq y20 (- y20 y))
(setq y21 (+ y21 y))
(setq pt20 (pt (- x12 x) y20 pt20))
(setq pt21 (pt (+ x12 x) y21 pt21))
(setq pt22 (pt (- x14 x) y20 pt22))
(setq pt23 (pt (+ x14 x) y21 pt23))
(setq pt24 (pt (- x1 x) y20 pt24))
(setq pt25 (pt (+ x1 x) y21 pt25))
(setq pt26 (pt (- x3 x) y20 pt26))
(setq pt27 (pt (+ x3 x) y21 pt27))
(setq pt28 (pt (- x5 x) y20 pt28))
(setq pt29 (pt (+ x5 x) y21 pt29))
(setq pt30 (pt (- x6 x) y20 pt30))
(setq pt31 (pt (+ x6 x) y21 pt31))
(command "line" pt20 pt21 "")
(command "line" pt22 pt23 "")
(command "line" pt24 pt25 "")
(command "line" pt26 pt27 "")
(command "line" pt28 pt29 "")
(command "line" pt30 pt31 "")
(command "line" pt21 pt31 "")
(command "line" pt20 pt30 "")
This Lisp code is used to draw a plan view of a bridge abutment. The comments within the code suggest that this is part of a larger program that involves the design
and drawing of a bridge.
The first few lines of code are used to calculate the coordinates of various points on the drawing, which are then stored in variables for later use.
(setq y20 (+ yc (/ abtlen 2)))
(setq y21 (- y20 abtlen))
(setq y16 (+ y20 0.15))
(setq y17 (- y21 0.15))
These lines calculate the y-coordinates of various points on the drawing. yc is the y-coordinate of the centerline of the bridge, abtlen is the length of the abutment, and
0.15 is a constant used to calculate the height of the abutment footing.
The next few lines calculate the length of the abutment footing and then use it to calculate the x-coordinate of certain points on the drawing.
(setq footl (- y16 y17))
(setq footl (/ footl 2))
(setq x (* footl s))
(setq y (* footl (- 1 c)))
footl is the length of the abutment footing, which is calculated as half the difference between the y-coordinates of the top and bottom of the footing. s and c are
constants used to calculate the skew of the bridge. The x and y coordinates of certain points on the drawing are then calculated using footl, s, and c.
The next few lines calculate the coordinates of certain points on the drawing.
(setq pt16 (pt (- x10 x) (- y16 y) pt16))
(setq pt17 (pt (+ x10 x) (+ y17 y) pt17))
(setq pt18 (pt (- x7 x) (- y16 y) pt18))
(setq pt19 (pt (+ x7 x) (+ y17 y) pt19))
These lines use the pt function to create new points with the specified x and y coordinates. The pt function takes three arguments: the x-coordinate, the y-coordinate,
and the name of the point variable to which the new point should be assigned. The x and y coordinates used here were calculated in the previous step.
The next two lines of code calculate the coordinates of two more points.
(setq pt14 (pt x14 rtl pta14))
(setq pt15 (pt x12 rtl pta15))
These lines create two more points using the pt function. The rtl and ptaxx values are not defined in the code provided, so it is unclear exactly what these lines are
doing.
The final part of the code uses the command function to draw lines between the various points on the drawing.
(command "line" pt16 pt17 pt19 pt18 pt16 "")
(command "line" pt20 pt21 "")
(command "line" pt22 pt23 "")
(command "line" pt24 pt25 "")
(command "line" pt26 pt27 "")
(command "line" pt28 pt29 "")
(command "line" pt30 pt31 "")
(command "line" pt21 pt31 "")
(command "line" pt20 pt30 "")
These lines of code are drawing lines between various points on the AutoCAD canvas using the command function.
The command function in AutoLISP is used to execute an AutoCAD command as if the user was typing it in the command line. In this case, the line command is being
executed to draw straight lines between various points.
Here's a breakdown of the lines of code:
(command "line" pt16 pt17 pt19 pt18 pt16 ""): This draws a polygon connecting the points pt16, pt17, pt19, pt18, and pt16 in that order. The "" at the end of the
command is used to tell AutoCAD to close the polygon by drawing a line between the last and first points.
(command "line" pt20 pt21 ""): This draws a straight line between the points pt20 and pt21.
(command "line" pt22 pt23 ""): This draws a straight line between the points pt22 and pt23.
(command "line" pt24 pt25 ""): This draws a straight line between the points pt24 and pt25.
(command "line" pt26 pt27 ""): This draws a straight line between the points pt26 and pt27.
(command "line" pt28 pt29 ""): This draws a straight line between the points pt28 and pt29.
(command "line" pt30 pt31 ""): This draws a straight line between the points pt30 and pt31.
(command "line" pt21 pt31 ""): This draws a straight line between the points pt21 and pt31.
(command "line" pt20 pt30 ""): This draws a straight line between the points pt20 and pt30.
Taken together, these lines of code draw various lines and polygons in AutoCAD, creating a detailed drawing of an abutment.
***********************************************************************************
***********************************************************************************
***********************************************************************************
***********************************************************************************
***********************************************************************************
***********************************************************************************
***********************************************************************************
***********************************************************************************