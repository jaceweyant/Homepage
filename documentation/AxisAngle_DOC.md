Axis-Angle Rotation Matrices Documentation
#######################################################################################################

To convert from axis-angle form to a rotation matrix we use the Rodriguez formula.
We need to decompose the point to be rotated into its coordinate about the axis and its coordinates about an orthogonal plane.
The planar coordinates are then rotated by a 2D rotation of angle theta.

Any point p can be decomposed into a sum of a component p.par, parallel to a,
and p.perp, orthogonal such that p = p.par + p.perp

p.par = (a . p)*a
p.perp = p - (a . p)*a

The rotation leaves p.par unchanged and rotates the p.perp component by theta around the axis to point p.perp'
with changed direction by unchanged magnitude

We need to derive a basis (e1, e2) for the orthogonal plane to a
e1 = a x p.par
e2 = a x e1

The coordinates of p.perp with respect to this new basis are
p.perp = 0*e1 - 1*e2                        which we will just call (0,-1)
p.perp' = sin(theta)*e1 - cos(theta)*e2     which we will just call (sin(theta), -cos(theta))

Projecting p.perp back into the original space we have
p.perp' = sin(theta)*(a x p) + cos(theta)*p.perp

And reconstructing the rotated point p' we have
p' = (a . p)*a + sin(theta)(a x p) + cos(theta)(p - (a . p)*a)

or rearranged,
p' = cos(theta)*p + sin(theta)*(a x p) + (1 - cos(theta))*(a . p)*a

Then we can express the term a x p = A*p as a matrix multiplication and get p'
p' = R*p = (I + sin(theta)*A + (1-cos(theta))*A^2) * p  

#######################################################################################################

However, all this being said I found a simpler model which is derived from above
Given the following variables to simplify:

c = cos(theta)
s = sin(theta)
t = 1 - c
x = normalized axis.x
y = normalized axis.y
z = normalized axis.z

The Rotation Matrix can be written as the sum of 3 matrices:
    [1, 0, 0]       [x*x, x*y, x*z]       [0, -z,  y]     [t*x*x + c,    t*x*y - z*s,  t*x*z + y*s]
c * [0, 1, 0] + t * [x*y, y*y, y*z] + s * [z,  0, -x]  =  [t*x*y + z*s,  t*y*y + c,    t*y*z - x*s]
    [0, 0, 1]       [x*z, y*z, z*z]       [-y, x,  0]     [t*x*z - y*s,  t*y*z + x*s,  t*z*z + c  ]




