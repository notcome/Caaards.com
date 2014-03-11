-- addWord.lua (word star) (notes)

if redis.call('EXISTS', KEYS[1]) then
  return false
end

redis.call('SET', KEYS[1], ARGV[1]),
redis.call('INCR', KEYS[2])

return true