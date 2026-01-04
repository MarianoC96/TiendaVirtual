const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        // Allow public access if explicitly designed, but for admin actions we need user.
        // If we want to strictly enforce, return 401. 
        // For GET requests that are public, we might not need this.
        // But for tracking "created_by", we need it on POST.
        req.user = null;
        return next();
    }

    try {
        // Decoding base64 token as per auth.js implementation
        const decodedStr = Buffer.from(token, 'base64').toString('utf-8');
        const decoded = JSON.parse(decodedStr);
        req.user = { id: decoded.userId };
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        // Invalid token
        return res.status(403).json({ message: 'Token inválido' });
    }
};

const requireAuth = (req, res, next) => {
    verifyToken(req, res, () => {
        if (!req.user) {
            return res.status(401).json({ message: 'Autenticación requerida' });
        }
        next();
    });
};

module.exports = { verifyToken, requireAuth };
